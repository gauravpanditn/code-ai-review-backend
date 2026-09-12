import { Pinecone } from "@pinecone-database/pinecone";
import "dotenv/config";

const pc = new Pinecone({
  apiKey: process.env.PINECONE_DB_API_KEY as string,
});

export const pineconeIndex = pc.index(
  process.env.PINECONE_INDEX as string
);