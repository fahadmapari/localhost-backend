import { db } from "@/db";
import { products, productVariants } from "@/db/schema";
import { eq, sql, desc, gte, ilike, inArray, or, and } from "drizzle-orm";
import { DeleteObjectsCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { S3_BUCKET_NAME } from "@/config/env";
import { randomUUID } from "crypto";
import path from "path";
import s3Client from "@/config/s3";
import { ProductType } from "@/schema/product.schema";
import dayjs from "dayjs";
import slug from "slug";
import { nanoid } from "nanoid";
import { PRODUCT_CODE_KEY_PREFIX } from "@/config/constants";
import { EditedProduct } from "@/types/product.types";
import _ from "lodash";
import { createError } from "@/utils/errorHandlers";
import { enqueueProductEmbeddingJob } from "@/jobs/product-embedding.job";
import type { ProductVariant, Product } from "@/db/schema";

export const updateProductById = async (
  id: string,
  editedProduct: EditedProduct,
  files: Express.Multer.File[],
) => {
  const oldBaseProduct = await db.query.products.findFirst({
    where: eq(products.id, editedProduct.baseProductId),
  });
  const oldProduct = await db.query.productVariants.findFirst({
    where: eq(productVariants.id, editedProduct.id),
  });

  if (oldProduct?.bookingType !== editedProduct.bookingType) {
    const instantLangs = (oldBaseProduct?.tourGuideLanguageInstant ?? []) as string[];
    const onRequestLangs = (oldBaseProduct?.tourGuideLanguageOnRequest ?? []) as string[];

    if (
      (editedProduct.bookingType === "instant" && instantLangs.includes(editedProduct.tourGuideLanguage)) ||
      (editedProduct.bookingType === "request" && onRequestLangs.includes(editedProduct.tourGuideLanguage))
    ) {
      throw createError("Product already exists", 400);
    }

    if (editedProduct.bookingType === "instant") {
      await db.update(products).set({
        tourGuideLanguageInstant: [...instantLangs, editedProduct.tourGuideLanguage],
        tourGuideLanguageOnRequest: onRequestLangs.filter((l) => l !== editedProduct.tourGuideLanguage),
      }).where(eq(products.id, editedProduct.baseProductId));
    } else {
      await db.update(products).set({
        tourGuideLanguageOnRequest: [...onRequestLangs, editedProduct.tourGuideLanguage],
        tourGuideLanguageInstant: instantLangs.filter((l) => l !== editedProduct.tourGuideLanguage),
      }).where(eq(products.id, editedProduct.baseProductId));
    }
  }

  const existingImages = editedProduct.existingImages ?? [];
  const oldImages = (oldBaseProduct?.images ?? []) as string[];
  const deletedImages = existingImages.length ? _.difference(oldImages, existingImages) : [];

  if (deletedImages.length > 0) {
    await deleteMultipleImages(deletedImages);
    await db.update(products).set({ images: existingImages }).where(eq(products.id, editedProduct.baseProductId));
  }

  if (files.length > 0) {
    const newImages = await uploadProductImages(files, editedProduct.title);
    const currentImages = (
      await db.query.products.findFirst({ where: eq(products.id, editedProduct.baseProductId) })
    )?.images as string[] ?? [];
    await db.update(products).set({ images: [...currentImages, ...newImages] }).where(eq(products.id, editedProduct.baseProductId));
  }

  const { baseProductId, existingImages: _ei, id: _id, ...variantFields } = editedProduct as any;

  const [updatedProduct] = await db
    .update(productVariants)
    .set(variantFields)
    .where(eq(productVariants.id, id))
    .returning();

  return updatedProduct;
};

export const findProductById = async (id: string) => {
  return db.query.productVariants.findFirst({
    where: eq(productVariants.id, id),
    with: { baseProduct: true },
  });
};

export const fetchProductMetrics = async () => {
  const yearBackDate = dayjs().subtract(1, "year").toDate();

  const [
    [{ totalProductsCount }],
    [{ totalInstantProductsCount }],
    [{ totalOnRequestProductsCount }],
    last12MonthProducts,
    [{ totalUniqueProductCount }],
    topCountriesRaw,
    topCitiesRaw,
  ] = await Promise.all([
    db.select({ totalProductsCount: sql<number>`count(*)::int` }).from(productVariants),
    db.select({ totalInstantProductsCount: sql<number>`count(*)::int` }).from(productVariants).where(eq(productVariants.bookingType, "instant")),
    db.select({ totalOnRequestProductsCount: sql<number>`count(*)::int` }).from(productVariants).where(eq(productVariants.bookingType, "request")),
    db.select({ createdAt: products.createdAt }).from(products).where(gte(products.createdAt, yearBackDate)),
    db.select({ totalUniqueProductCount: sql<number>`count(*)::int` }).from(products),
    db.execute(
      sql`SELECT (meeting_point->>'country') AS country, count(*)::int AS count FROM product_variants GROUP BY country ORDER BY count DESC LIMIT 10`,
    ),
    db.execute(
      sql`SELECT (meeting_point->>'city') AS city, count(*)::int AS count FROM product_variants GROUP BY city ORDER BY count DESC LIMIT 10`,
    ),
  ]);

  const topCountriesAndCities = [{
    topCountries: (topCountriesRaw as any[]).map((r: any) => ({ _id: r.country, count: r.count })),
    topCities: (topCitiesRaw as any[]).map((r: any) => ({ _id: r.city, count: r.count })),
  }];

  return {
    totalProductsCount,
    totalInstantProductsCount,
    totalOnRequestProductsCount,
    last12MonthProducts,
    totalUniqueProductCount,
    topCountriesAndCities,
  };
};

export const getAllProducts = async (
  page: number,
  limit: number,
  bookingType: string,
  searchTerm: string,
) => {
  const conditions = [];

  if (searchTerm) {
    conditions.push(ilike(productVariants.description, `%${searchTerm}%`));
  }

  if (bookingType === "instant") conditions.push(eq(productVariants.bookingType, "instant"));
  else if (bookingType === "request") conditions.push(eq(productVariants.bookingType, "request"));
  else conditions.push(inArray(productVariants.bookingType, ["instant", "request"]));

  const where = conditions.length > 1 ? and(...conditions) : conditions[0];

  const [variantRows, [{ total }]] = await Promise.all([
    db.query.productVariants.findMany({
      where,
      with: { baseProduct: true },
      orderBy: [desc(productVariants.createdAt)],
      limit,
      offset: page * limit,
    }),
    db.select({ total: sql<number>`count(*)::int` }).from(productVariants).where(where),
  ]);

  return { products: variantRows, totalProducts: total };
};

export const addNewProduct = async (product: ProductType, images: string[]) => {
  return db.transaction(async (tx) => {
    const [createdProduct] = await tx
      .insert(products)
      .values({
        title: product.title,
        tourTextLanguage: product.tourTextLanguage as Product["tourTextLanguage"],
        tourGuideLanguageInstant: product.tourGuideLanguageInstant ?? [],
        tourGuideLanguageOnRequest: product.tourGuideLanguageOnRequest,
        images,
      })
      .returning();

    const productTitle = slug(createdProduct.title);
    const instantLangs = product.tourGuideLanguageInstant ?? [];
    const onRequestLangs = product.tourGuideLanguageOnRequest ?? [];

    const variantRows = [
      ...instantLangs.map((lang: string) => {
        const productCode = (PRODUCT_CODE_KEY_PREFIX + nanoid(6)).toUpperCase();
        return {
          ...buildVariantFields(product, createdProduct.id),
          bookingType: "instant" as const,
          tourGuideLanguage: lang,
          url: `${productTitle}-${productCode}`,
          productCode,
        };
      }),
      ...onRequestLangs.map((lang: string) => {
        const productCode = (PRODUCT_CODE_KEY_PREFIX + nanoid(6)).toUpperCase();
        return {
          ...buildVariantFields(product, createdProduct.id),
          bookingType: "request" as const,
          tourGuideLanguage: lang,
          url: `${productTitle}-${productCode}`,
          productCode,
        };
      }),
    ];

    await tx.insert(productVariants).values(variantRows);

    try {
      await enqueueProductEmbeddingJob(createdProduct.id);
    } catch (err) {
      console.error("Failed to enqueue product embedding job", err);
      await tx.update(products)
        .set({ embeddingStatus: "failed", embeddingLastError: "Failed to enqueue embedding job." })
        .where(eq(products.id, createdProduct.id));
    }

    return createdProduct;
  });
};

const buildVariantFields = (product: ProductType, baseProductId: string) => ({
  baseProductId,
  serviceType: product.serviceType as ProductVariant["serviceType"],
  tourType: product.tourType as ProductVariant["tourType"],
  activityType: product.activityType as ProductVariant["activityType"],
  subType: product.subType as ProductVariant["subType"],
  description: product.description,
  willSee: product.willSee,
  willLearn: product.willLearn,
  mandatoryInformation: product.mandatoryInformation,
  recommendedInformation: product.recommdendedInformation,
  included: product.included,
  excluded: product.excluded ?? [],
  activitySuitableFor: product.activitySuitableFor as ProductVariant["activitySuitableFor"],
  voucherType: product.voucherType as ProductVariant["voucherType"],
  maxPax: product.maxPax,
  meetingPoint: product.meetingPoint,
  endPoint: product.endPoint,
  tags: product.tags,
  closedDates: product.closedDates?.map((d: Date) => d.toISOString().split("T")[0]) ?? [],
  holidayDates: product.holidayDates?.map((d: Date) => d.toISOString().split("T")[0]) ?? [],
  availability: product.availability,
  cancellationTerms: product.cancellationTerms,
  release: product.realease,
  firstRoundReview: product.firstRoundReview ?? false,
  firstRoundReviewRemarks: product.firstRoundReviewRemarks ?? [],
  secondRoundReview: product.secondRoundReview ?? false,
  secondRoundReviewRemarks: product.secondRoundReviewRemarks ?? [],
  priceModel: product.priceModel as ProductVariant["priceModel"],
  currency: product.currency as ProductVariant["currency"],
  b2bRateInstant: String(product.b2bRateInstant),
  b2bExtraHourSupplementInstant: String(product.b2bExtraHourSupplementInsant ?? 0),
  b2bRateOnRequest: String(product.b2bRateOnRequest),
  b2bExtraHourSupplementOnRequest: String(product.b2bExtraHourSupplementOnRequest ?? 0),
  b2cRateInstant: String(product.b2cRateInstant),
  b2cExtraHourSupplementInstant: String(product.b2cExtraHourSupplementInstant ?? 0),
  b2cRateOnRequest: String(product.b2cRateOnRequest),
  b2cExtraHourSupplementOnRequest: String(product.b2cExtraHourSupplementOnRequest ?? 0),
  publicHolidaySupplementPercent: product.publicHolidaySupplementPercent != null ? String(product.publicHolidaySupplementPercent) : null,
  weekendSupplementPercent: product.weekendSupplementPercent != null ? String(product.weekendSupplementPercent) : null,
  isB2B: product.isB2B ?? true,
  isB2C: product.isB2C ?? true,
  overridePriceFromContract: product.overridePriceFromContract ?? false,
  isBookingPerProduct: product.isBookingPerProduct ?? false,
});

export const deleteMultipleImages = async (images: string[]) => {
  try {
    const command = new DeleteObjectsCommand({
      Bucket: S3_BUCKET_NAME,
      Delete: { Objects: images.map((image) => ({ Key: image })) },
    });
    return await s3Client.send(command);
  } catch (err) {
    console.error("Error deleting images:", err);
  }
};

export const uploadProductImages = async (files: Express.Multer.File[], title: string) => {
  const uploadedImages: string[] = [];

  for (const file of files) {
    const key = `products/product-${randomUUID()}-${title}-${path.extname(file.originalname)}`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: S3_BUCKET_NAME,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );
    uploadedImages.push(key);
  }

  return uploadedImages;
};

export const searchProuductsByTextService = async (searchTerm: string) => {
  return db.query.productVariants.findMany({
    where: ilike(productVariants.description, `%${searchTerm}%`),
    with: { baseProduct: true },
    orderBy: [desc(productVariants.createdAt)],
  });
};
