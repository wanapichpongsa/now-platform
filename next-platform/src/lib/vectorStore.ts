"use server";

import { env } from "./env";
import { Pinecone } from "@pinecone-database/pinecone";

export default async function embedAndStoreDocs(
  pc: Pinecone, 
  docId: number, // declare as params so accessible to catch(e)
  text: string
): Promise<void> {
  try {
  // Document instance has local id e.g., doc#1vec#1
  const pcIndex = pc.index("now-tech-1"); // no host url (latest) and namespace (free)
  const model = 'text-embedding-3-small';

  interface Record {
    id: string,
    text: string
  }
  const chunk = async (
    docId: number,
    text: string, 
    chunkSize: number = 1000
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

  console.log(await chunk(docId, text));

  // delay 30s before queryable
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  await delay(30000);

  console.info(`Successful embed upload of doc#${docId}`);

  } catch (error) {
    console.error(error);
    throw new Error(`Failed embed upload of doc#${docId}`)
  }
}