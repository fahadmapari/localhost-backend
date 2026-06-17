import { db } from "@/db";
import { products, productVariants } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ai } from "@/config/ai";
import { pc } from "@/config/pinecone";

function buildEmbeddingContent(product: any) {
  return `
      title: ${product.title},
      description: ${product.description},
      Instant Languages: ${(product.tourGuideLanguageInstant ?? []).join(", ")},
      On Request Languages: ${(product.tourGuideLanguageOnRequest ?? []).join(", ")},
      tour duration: ${product.availability.duration.value + product.availability.duration.unit},
      Meeting point for tour: ${product.meetingPoint.text}
      `;
}

export const syncProductEmbedding = async (baseProductId: string) => {
  try {
    await db.update(products)
      .set({ embeddingStatus: "processing", embeddingLastError: null })
      .where(eq(products.id, baseProductId));

    const variant = await db.query.productVariants.findFirst({
      where: eq(productVariants.baseProductId, baseProductId),
      with: { baseProduct: true },
    });

    const baseProduct = variant?.baseProduct as any;

    if (!variant || !baseProduct?.id) {
      throw new Error("Product variant or base product not found.");
    }

    const mp = variant.meetingPoint as any;
    const avail = variant.availability as any;

    if (!mp || !avail?.duration) {
      throw new Error("Product variant is missing embedding fields.");
    }

    const embeddedProduct = await ai.models.embedContent({
      model: "gemini-embedding-001",
      contents: buildEmbeddingContent({
        title: baseProduct.title,
        description: variant.description,
        tourGuideLanguageInstant: baseProduct.tourGuideLanguageInstant ?? [],
        tourGuideLanguageOnRequest: baseProduct.tourGuideLanguageOnRequest ?? [],
        availability: avail,
        meetingPoint: mp,
      }),
      config: { outputDimensionality: 768 },
    });

    const embeddingValues = embeddedProduct.embeddings?.[0]?.values;
    if (!embeddingValues || embeddingValues.length === 0) {
      throw new Error("No embedding values returned from Gemini.");
    }

    const index = pc.index({ name: "tours" });

    await index.upsert({
      records: [
        {
          id: baseProductId,
          values: embeddingValues,
          metadata: {
            title: baseProduct.title,
            city: mp.city,
            country: mp.country,
            duration: avail.duration.value,
            b2bPriceInstant: variant.b2bRateInstant,
            b2cPriceInstant: variant.b2cRateInstant,
            b2bPriceOnRequest: variant.b2bRateOnRequest,
            b2cPriceOnRequest: variant.b2cRateOnRequest,
          },
        },
      ],
    });

    await db.update(products)
      .set({ embeddingStatus: "completed", embeddingLastError: null })
      .where(eq(products.id, baseProductId));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Embedding sync failed.";
    await db.update(products)
      .set({ embeddingStatus: "failed", embeddingLastError: message })
      .where(eq(products.id, baseProductId));
    throw error;
  }
};
