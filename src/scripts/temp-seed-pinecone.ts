import mongoose from "mongoose";
import { ai } from "../config/ai";
import { pc } from "../config/pinecone";
import { connectDB } from "../db/mongoDB";
import { ProductVariant } from "../models/product.model";

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

async function seedPineconeEmbeddings() {
  await connectDB();

  try {
    const variants = await ProductVariant.find({})
      .populate("baseProduct")
      .lean();

    const uniqueProducts = new Map<string, any>();

    for (const variant of variants) {
      const baseProduct = variant.baseProduct as any;

      if (!baseProduct?._id || uniqueProducts.has(baseProduct._id.toString())) {
        continue;
      }

      uniqueProducts.set(baseProduct._id.toString(), {
        id: baseProduct._id.toString(),
        title: baseProduct.title,
        description: variant.description,
        tourGuideLanguageInstant: baseProduct.tourGuideLanguageInstant ?? [],
        tourGuideLanguageOnRequest: baseProduct.tourGuideLanguageOnRequest ?? [],
        availability: variant.availability,
        meetingPoint: variant.meetingPoint,
        b2bRateInstant: variant.b2bRateInstant,
        b2cRateInstant: variant.b2cRateInstant,
        b2bRateOnRequest: variant.b2bRateOnRequest,
        b2cRateOnRequest: variant.b2cRateOnRequest,
      });
    }

    const index = pc.index({
      name: "tours",
    });

    let processed = 0;

    for (const product of uniqueProducts.values()) {
      const embeddedProduct = await ai.models.embedContent({
        model: "gemini-embedding-001",
        contents: buildEmbeddingContent(product),
        config: {
          outputDimensionality: 768,
        },
      });

      const embeddingValues = embeddedProduct.embeddings?.[0]?.values;

      if (!embeddingValues || embeddingValues.length === 0) {
        console.log(`Skipping ${product.id}: no embeddings returned`);
        continue;
      }

      await index.upsert({
        records: [
          {
            id: product.id,
            values: embeddingValues,
            metadata: {
              title: product.title,
              city: product.meetingPoint.city,
              country: product.meetingPoint.country,
              duration: product.availability.duration.value,
              b2bPriceInstant: product.b2bRateInstant,
              b2cPriceInstant: product.b2cRateInstant,
              b2bPriceOnRequest: product.b2bRateOnRequest,
              b2cPriceOnRequest: product.b2cRateOnRequest,
            },
          },
        ],
      });

      processed += 1;
      console.log(`Upserted embedding for product ${product.id}`);
    }

    console.log(`Completed Pinecone seed. Total upserted: ${processed}`);
  } finally {
    await mongoose.disconnect();
  }
}

seedPineconeEmbeddings().catch((error) => {
  console.error("Failed to seed Pinecone embeddings", error);
  process.exit(1);
});
