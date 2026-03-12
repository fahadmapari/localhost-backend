import Product, { ProductVariant } from "../models/product.model";
import { ai } from "../config/ai";
import { pc } from "../config/pinecone";

function buildEmbeddingContent(product: any) {
  return `
      title: ${product.title}, 
      description: ${product.description}, 
      Instant Languages: ${product.tourGuideLanguageInstant?.join(", ")},
      On Request Languages: ${product.tourGuideLanguageOnRequest?.join(", ")},
      tour duration: ${product.availability.duration.value + product.availability.duration.unit},
      Meeting point for tour: ${product.meetingPoint.text}
      `;
}

export const syncProductEmbedding = async (baseProductId: string) => {
  try {
    await Product.findByIdAndUpdate(baseProductId, {
      embeddingStatus: "processing",
      embeddingLastError: null,
    });

    const variant = await ProductVariant.findOne({
      baseProduct: baseProductId,
    })
      .populate("baseProduct")
      .lean();

    const baseProduct = variant?.baseProduct as any;

    if (!variant || !baseProduct?._id) {
      throw new Error("Product variant or base product not found.");
    }

    if (!variant.meetingPoint || !variant.availability?.duration) {
      throw new Error("Product variant is missing embedding fields.");
    }

    const embeddedProduct = await ai.models.embedContent({
      model: "gemini-embedding-001",
      contents: buildEmbeddingContent({
        title: baseProduct.title,
        description: variant.description,
        tourGuideLanguageInstant: baseProduct.tourGuideLanguageInstant ?? [],
        tourGuideLanguageOnRequest: baseProduct.tourGuideLanguageOnRequest ?? [],
        availability: variant.availability,
        meetingPoint: variant.meetingPoint,
      }),
      config: {
        outputDimensionality: 768,
      },
    });

    const embeddingValues = embeddedProduct.embeddings?.[0]?.values;

    if (!embeddingValues || embeddingValues.length === 0) {
      throw new Error("No embedding values returned from Gemini.");
    }

    const index = pc.index({
      name: "tours",
    });

    await index.upsert({
      records: [
        {
          id: baseProductId,
          values: embeddingValues,
          metadata: {
            title: baseProduct.title,
            city: variant.meetingPoint.city,
            country: variant.meetingPoint.country,
            duration: variant.availability.duration.value,
            b2bPriceInstant: variant.b2bRateInstant,
            b2cPriceInstant: variant.b2cRateInstant,
            b2bPriceOnRequest: variant.b2bRateOnRequest,
            b2cPriceOnRequest: variant.b2cRateOnRequest,
          },
        },
      ],
    });

    await Product.findByIdAndUpdate(baseProductId, {
      embeddingStatus: "completed",
      embeddingLastError: null,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Embedding sync failed.";

    await Product.findByIdAndUpdate(baseProductId, {
      embeddingStatus: "failed",
      embeddingLastError: message,
    });

    throw error;
  }
};
