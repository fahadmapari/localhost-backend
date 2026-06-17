import { db } from "@/db";
import { products, productVariants } from "@/db/schema";
import { inArray, desc, eq, sql } from "drizzle-orm";
import { ai } from "@/config/ai";
import { pc } from "@/config/pinecone";
import { createError } from "@/utils/errorHandlers";

export const rewriteText = async (text: string) => {
  const res = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Rewrite this tour description and give me the rewritten text only in response (No multiple options, No other text): "${text}"`,
  });

  if (!res.text) throw createError("Something went wrong", 500);
  return res.text;
};

export const productQueryService = async (query: string) => {
  const embeddedQuery = await ai.models.embedContent({
    model: "gemini-embedding-001",
    contents: query,
    config: { outputDimensionality: 768 },
  });

  if (typeof embeddedQuery.embeddings === "undefined") {
    throw createError("Something went wrong while working with the user query.", 500);
  }

  const index = pc.index({ name: "tours" });

  const results = await index.query({
    vector: embeddedQuery.embeddings[0].values || [],
    topK: 10,
    includeMetadata: true,
  });

  // Pinecone IDs are now postgres UUIDs
  const baseProductIds = results.matches.map((match) => match.id).filter(Boolean);

  if (baseProductIds.length === 0) {
    return ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are a helpful assistant. The user asked: "${query}". No relevant tour data was found. Respond with "I don't know".`,
    }).then((r) => r.text);
  }

  // Get the most-recent variant per base product (DISTINCT ON equivalent)
  const variantRows = await db.execute(sql`
    SELECT DISTINCT ON (pv.base_product_id)
      pv.*,
      p.title AS base_title,
      p.tour_guide_language_instant,
      p.tour_guide_language_on_request
    FROM product_variants pv
    JOIN products p ON pv.base_product_id = p.id
    WHERE pv.base_product_id = ANY(${baseProductIds}::uuid[])
    ORDER BY pv.base_product_id, pv.created_at DESC
  `);

  const contextData = (variantRows as any[])
    .map(
      (pv: any) =>
        `Tour title: ${pv.base_title}\n Description: ${pv.description}\n Instant Languages: ${(pv.tour_guide_language_instant ?? []).join(", ")}\n On Request Languages: ${(pv.tour_guide_language_on_request ?? []).join(", ")}\nDuration: ${pv.availability?.duration?.value}${pv.availability?.duration?.unit}\n Meeting point: ${pv.meeting_point?.text}\n b2b price instant: ${pv.b2b_rate_instant}\n b2c price instant: ${pv.b2c_rate_instant}\n b2b price on request: ${pv.b2b_rate_on_request}\n b2c price on request: ${pv.b2c_rate_on_request}\n`,
    )
    .join("\n---\n");

  const res = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `
      You are a helpful assistant of our company which sells different types of tours in b2b and b2c segment. Use the following data which we fetched from the database which we thing is related to user's query. Data is list of tours we provide. Analyze the user query and data and give answer in a precise way. if you can't answer the question, just say "I don't know".

      <CONTEXT_DATA>
        ${contextData}
      </CONTEXT_DATA>

      Users query: ${query}
      `,
  });

  return res.text;
};
