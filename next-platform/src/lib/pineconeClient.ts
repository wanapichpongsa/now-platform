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
    console.log("error: " + error);
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
    const indexExists: boolean = await new Promise<boolean>(() => {
      existingIndexes.indexes?.map((index) => {
        if (index.name === "now-tech-1") return true
      })
      return false
    })
    if (!indexExists) {
      createIndex(pc);
    } else {
      console.log("index 'now-tech-1' already exists");
    }
    return pc
  } catch (error) {
    console.log("error: " + error);
    throw new Error("Pinecone client initialization failed"); // createIndex nested, so parent fn also fails, both error msg should be mentioned
  }
}

export async function getPineconeClient() {
  if (!pc) {
    pc = await initPineconeClient();
  }

  return pc
}