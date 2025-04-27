"use server";

import { env } from "./env";
import { Pinecone } from "@pinecone-database/pinecone";
import { OpenAI } from "openai";

export default async function embedAndStoreDocs(
  pc: Pinecone, 
  docId: number, // declare as params so accessible to catch(e)
  text: string
): Promise<void> {
  try {
  // Document instance has local id e.g., doc#1vec#1
  interface Record {
    id: string,
    text: string
  }
  
  // HINDSIGHT: Each record should be each invoice line or contiguous lines per day instead
  const chunkToRecords = async (
    docId: number,
    text: string, 
    chunkSize: number = 500
  ): Promise<Record[]> => {
    const iterations = Math.ceil(text.length / chunkSize); // 1.01 -> 2
    console.log(`text.length: ${text.length} iterations: ${iterations}`);
    let chunks: Record[] = [];
    for (let i = 0; i < iterations; i++) {
      const lowerBound = i * chunkSize;
      const upperBound = Math.min((i + 1) * chunkSize, text.length); // self-explanatory
      const chunk = text.slice(lowerBound, upperBound);
      chunks.push({id: `doc#${docId}vec#${i+1}`, text: chunk});
    }
    return chunks
  }

  const records: Record[] = await(chunkToRecords(docId, text));
  console.log(records);

  // 252 chars invoice table => 1,536 val, <$0.01, 111 input tokens
  const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: records.map(r => r.text),
  });
  const embeddings: number[][] = response.data.map(e => e.embedding);

  const numEmbeddingValues = embeddings.reduce((sum, e) => sum + e.length, 0);
  console.log(numEmbeddingValues)

  const vectors = records.map((r, i) => ({
    id: r.id,
    values: embeddings[i],
    metadata: { text: r.text }
  }));

  const pcIndex = pc.index("now-tech-1"); // no host url (latest) and namespace (free)
  await pcIndex.upsert(vectors);
  
  // delay 30s before queryable
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  await delay(30000);

  console.info(`Successful embed upload of doc#${docId}`);

  } catch (error) {
    console.error(error);
    throw new Error(`Failed embed upload of doc#${docId}`)
  }
}