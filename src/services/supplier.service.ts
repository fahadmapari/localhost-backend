import path from "path";
import { randomUUID } from "crypto";
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import s3Client from "@/config/s3";
import { S3_BUCKET_NAME } from "@/config/env";
import { db } from "@/db";
import { suppliers } from "@/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { SupplierCreateInput, SupplierUpdateInput } from "@/schema/supplier.schema";
import { createError } from "@/utils/errorHandlers";
import { STANDARD_RATE_TIER_HOURS } from "@/config/constants";

const seedRateTiers = (tiers: SupplierCreateInput["contract"]["rateTiers"]) => {
  const provided = tiers ?? [];
  if (provided.length > 0) return provided;
  return STANDARD_RATE_TIER_HOURS.map((hours) => ({ hours, rate: undefined }));
};

const uploadSupplierFileToS3 = async (
  file: Express.Multer.File,
  supplierId: string,
  kind: "photo" | "cv",
): Promise<{ key: string }> => {
  const ext = path.extname(file.originalname);
  const key = `suppliers/${supplierId}/${kind}-${randomUUID()}${ext}`;
  await s3Client.send(
    new PutObjectCommand({ Bucket: S3_BUCKET_NAME, Key: key, Body: file.buffer, ContentType: file.mimetype }),
  );
  return { key };
};

const deleteS3Object = async (key: string) => {
  try {
    await s3Client.send(new DeleteObjectCommand({ Bucket: S3_BUCKET_NAME, Key: key }));
  } catch {
    // Best-effort deletion.
  }
};

export const createSupplierService = async (data: SupplierCreateInput, createdBy: string) => {
  const existing = await db.execute(
    sql`SELECT id FROM suppliers WHERE contact->>'email' = ${data.contact.email} LIMIT 1`,
  );
  if ((existing as any[]).length > 0) {
    throw createError("A supplier with this email already exists", 409);
  }

  const [supplier] = await db
    .insert(suppliers)
    .values({
      personalInfo: data.personalInfo,
      addresses: data.addresses ?? [],
      contact: data.contact,
      experience: data.experience,
      billing: data.billing,
      contract: { ...data.contract, rateTiers: seedRateTiers(data.contract.rateTiers) },
      cancellationTerms: data.cancellationTerms ?? [],
      amendments: data.amendments ?? [],
      locationSupplements: data.locationSupplements ?? [],
      languageSupplements: data.languageSupplements ?? [],
      docs: data.docs,
      serviceConfig: data.serviceConfig,
      comments: data.comments,
      autoBookings: data.autoBookings,
      employee: data.employee,
      status: (data.status ?? "Pending") as any,
      createdBy,
    })
    .returning();

  return supplier;
};

export const getAllSuppliersService = async (
  page: number,
  limit: number,
  status?: string,
  searchTerm?: string,
) => {
  const conditions = [];

  if (status && status !== "all") {
    conditions.push(eq(suppliers.status, status as any));
  }

  if (searchTerm) {
    const escaped = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    conditions.push(
      sql`(
        suppliers.personal_info->>'firstName' ILIKE ${"%" + escaped + "%"} OR
        suppliers.personal_info->>'lastName' ILIKE ${"%" + escaped + "%"} OR
        suppliers.contact->>'email' ILIKE ${"%" + escaped + "%"}
      )`,
    );
  }

  const where = conditions.length > 1 ? and(...conditions) : conditions[0];

  const [supplierRows, [{ total }]] = await Promise.all([
    db.select().from(suppliers).where(where).orderBy(desc(suppliers.createdAt)).limit(limit).offset(page * limit),
    db.select({ total: sql<number>`count(*)::int` }).from(suppliers).where(where),
  ]);

  return { suppliers: supplierRows, total };
};

export const getSupplierByIdService = async (id: string) => {
  const supplier = await db.query.suppliers.findFirst({ where: eq(suppliers.id, id) });
  if (!supplier) throw createError("Supplier not found", 404);
  return supplier;
};

export const updateSupplierService = async (
  id: string,
  data: SupplierUpdateInput,
  updatedBy: string,
) => {
  if (data.contact?.email) {
    const existing = await db.execute(
      sql`SELECT id FROM suppliers WHERE contact->>'email' = ${data.contact.email} AND id != ${id} LIMIT 1`,
    );
    if ((existing as any[]).length > 0) {
      throw createError("Another supplier already uses this email", 409);
    }
  }

  const [supplier] = await db
    .update(suppliers)
    .set({ ...(data as any), updatedBy })
    .where(eq(suppliers.id, id))
    .returning();

  if (!supplier) throw createError("Supplier not found", 404);
  return supplier;
};

export const deleteSupplierService = async (id: string) => {
  const [supplier] = await db.delete(suppliers).where(eq(suppliers.id, id)).returning();
  if (!supplier) throw createError("Supplier not found", 404);

  const docs = supplier.docs as any;
  if (docs?.photoUpload) await deleteS3Object(docs.photoUpload);
  if (docs?.cvUpload) await deleteS3Object(docs.cvUpload);
  return supplier;
};

export const searchActiveSuppliersService = async (searchTerm?: string) => {
  if (searchTerm) {
    const escaped = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return db.execute(sql`
      SELECT id,
        personal_info->>'firstName' AS "firstName",
        personal_info->>'lastName' AS "lastName",
        contact->>'email' AS email,
        contact->'mobile' AS mobile,
        experience->'guidingLanguages' AS "guidingLanguages",
        experience->'guidingLocation' AS "guidingLocation",
        status
      FROM suppliers
      WHERE status = 'Active'
        AND (
          personal_info->>'firstName' ILIKE ${"%" + escaped + "%"} OR
          personal_info->>'lastName' ILIKE ${"%" + escaped + "%"} OR
          contact->>'email' ILIKE ${"%" + escaped + "%"}
        )
      ORDER BY personal_info->>'firstName' ASC
      LIMIT 50
    `);
  }

  return db.execute(sql`
    SELECT id,
      personal_info->>'firstName' AS "firstName",
      personal_info->>'lastName' AS "lastName",
      contact->>'email' AS email,
      contact->'mobile' AS mobile,
      experience->'guidingLanguages' AS "guidingLanguages",
      experience->'guidingLocation' AS "guidingLocation",
      status
    FROM suppliers
    WHERE status = 'Active'
    ORDER BY personal_info->>'firstName' ASC
    LIMIT 50
  `);
};

export const uploadSupplierPhotoService = async (
  id: string,
  file: Express.Multer.File,
  updatedBy: string,
) => {
  const supplier = await db.query.suppliers.findFirst({ where: eq(suppliers.id, id) });
  if (!supplier) throw createError("Supplier not found", 404);

  const previous = (supplier.docs as any)?.photoUpload;
  const { key } = await uploadSupplierFileToS3(file, id, "photo");

  const currentDocs = (supplier.docs as any) ?? {};
  await db
    .update(suppliers)
    .set({ docs: { ...currentDocs, photoUpload: key }, updatedBy })
    .where(eq(suppliers.id, id));

  if (previous) await deleteS3Object(previous);
  return { key };
};

export const uploadSupplierCvService = async (
  id: string,
  file: Express.Multer.File,
  updatedBy: string,
) => {
  const supplier = await db.query.suppliers.findFirst({ where: eq(suppliers.id, id) });
  if (!supplier) throw createError("Supplier not found", 404);

  const previous = (supplier.docs as any)?.cvUpload;
  const { key } = await uploadSupplierFileToS3(file, id, "cv");

  const currentDocs = (supplier.docs as any) ?? {};
  await db
    .update(suppliers)
    .set({ docs: { ...currentDocs, cvUpload: key }, updatedBy })
    .where(eq(suppliers.id, id));

  if (previous) await deleteS3Object(previous);
  return { key };
};

export const deleteSupplierPhotoService = async (id: string, updatedBy: string) => {
  const supplier = await db.query.suppliers.findFirst({ where: eq(suppliers.id, id) });
  if (!supplier) throw createError("Supplier not found", 404);

  const previous = (supplier.docs as any)?.photoUpload;
  const currentDocs = (supplier.docs as any) ?? {};
  const { photoUpload: _removed, ...remainingDocs } = currentDocs;

  await db.update(suppliers).set({ docs: remainingDocs, updatedBy }).where(eq(suppliers.id, id));
  if (previous) await deleteS3Object(previous);
  return { success: true };
};

export const deleteSupplierCvService = async (id: string, updatedBy: string) => {
  const supplier = await db.query.suppliers.findFirst({ where: eq(suppliers.id, id) });
  if (!supplier) throw createError("Supplier not found", 404);

  const previous = (supplier.docs as any)?.cvUpload;
  const currentDocs = (supplier.docs as any) ?? {};
  const { cvUpload: _removed, ...remainingDocs } = currentDocs;

  await db.update(suppliers).set({ docs: remainingDocs, updatedBy }).where(eq(suppliers.id, id));
  if (previous) await deleteS3Object(previous);
  return { success: true };
};
