import { db, connectDB } from "@/db";
import { syncProductEmbedding } from "@/services/product-embedding.service";

async function seedPineconeEmbeddings() {
  await connectDB();

  try {
    const variants = await db.query.productVariants.findMany({
      with: { baseProduct: true },
    });

    const uniqueProductIds = new Set<string>();
    for (const variant of variants) {
      if (variant.baseProduct?.id) {
        uniqueProductIds.add(variant.baseProduct.id);
      }
    }

    let processed = 0;
    for (const baseProductId of uniqueProductIds) {
      await syncProductEmbedding(baseProductId);
      processed++;
      console.log(`Upserted embedding for product ${baseProductId}`);
    }

    console.log(`Completed Pinecone seed. Total upserted: ${processed}`);
  } finally {
    process.exit(0);
  }
}

seedPineconeEmbeddings().catch((error) => {
  console.error("Failed to seed Pinecone embeddings", error);
  process.exit(1);
});
