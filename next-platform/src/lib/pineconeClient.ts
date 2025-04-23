"use server";
import { Pinecone } from "@pinecone-database/pinecone";
import { env } from "./env";

// A function for those who want to init Pinecone Indexes via API

/* 
Union type mutable declaration known as 'singleton instance'
Node.js && Next.js cache module && its module variables after first import, 
so any file that imports and callsgetPineconeClient() 
will share same pc instance.
*/
let pc: Pinecone | null = null;

async function createIndex(pc: Pinecone): Promise<void> {
  try {
    await pc.createIndex({
      name: "now-tech-1",
      dimension: 1536, // text-embedding-3-small (most cost effective OpenAI)
      metric: 'cosine',
      spec: {
        serverless: { 
          cloud: 'aws', // (only option free plan)
          region: 'us-east-1'
        }
      }
    });
  } catch (error) {
    console.error(error);
    throw new Error("Index creation failed");
  }
}

async function initPineconeClient() {
  try {
    const pc = new Pinecone({
      apiKey: env.PINECONE_API_KEY
    });
    const existingIndexes = await pc.listIndexes();
    // can't simply .includes because IndexList is an object not array
    /*
      {
        indexes: {name: string, ...}[]
      }
    */
    console.info("Checking pre-existing indexes");
    const indexExists: boolean = await new Promise<boolean>((resolve) => {
      const exists = existingIndexes.indexes?.some((index) => index.name === "now-tech-1") ?? false;
      if (exists) {
        console.log("index 'now-tech-1' already exists");
      } else {
        console.log("index 'now-tech-1' doesn't exist");
      }
      resolve(exists); // need resolve for promise to change to 'fulfilled' state
    });

    if (!indexExists) {
      console.log("Creating index 'now-tech-1'...")
      createIndex(pc);
    }
    return pc

  } catch (error) {
    console.error(error);
    throw new Error("Pinecone client initialization failed"); // createIndex nested, so parent fn also fails, both error msg should be mentioned
  }
}

// createIndex: boolean = false?
export default async function getPineconeClient() {
  if (!pc) {
    pc = await initPineconeClient();
  }

  return pc
}