"use server";

import getPDFChunks from "@/lib/pdfParser";
import embedAndStoreDocs from "@/lib/vectorStore";
import getPineconeClient from "@/lib/pineconeClient";
import { Pinecone } from "@pinecone-database/pinecone";
import { Document as LangDocument } from "@langchain/core/documents";

// Using Node.js built-in assert for testing
import assert from 'assert';

// paste sensitive data in .env.local
const cleanData: string = process.env.CLEAN_DATA!;

async function testPDFAndVectorStore() {
  try {
    
    console.info("Init Pinecone client");
    const pc = await getPineconeClient();
    assert(pc instanceof Pinecone, 'Pinecone client should be an instance of Pinecone');

    console.info("Embedding and storing docs");
    await embedAndStoreDocs(pc, 1, cleanData);
    console.log('Test passed successfully');
  } catch (error) {
    console.error('Test failed:', error);
    throw error;
  }
}

// Run the test
await testPDFAndVectorStore();