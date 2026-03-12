import { Pinecone } from "@pinecone-database/pinecone";
import { PINECONE_KEY } from "./env";

if (!PINECONE_KEY) {
  throw new Error("Missing Pinecone API key. Set PINECONE_KEY in your env file.");
}

export const pc = new Pinecone({
  apiKey: PINECONE_KEY,
});
