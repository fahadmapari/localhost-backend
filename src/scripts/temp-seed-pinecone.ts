import mongoose from "mongoose";
import { connectDB } from "../db/mongoDB";
import { ProductVariant } from "../models/product.model";
import { syncProductEmbedding } from "../services/product-embedding.service";

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

      uniqueProducts.set(baseProduct._id.toString(), baseProduct._id.toString());
    }

    let processed = 0;

    for (const baseProductId of uniqueProducts.values()) {
      await syncProductEmbedding(baseProductId);

      processed += 1;
      console.log(`Upserted embedding for product ${baseProductId}`);
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
