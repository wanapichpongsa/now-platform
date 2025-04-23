"use server";

import getPDFChunks from "@/lib/pdfParser";
import embedAndStoreDocs from "@/lib/vectorStore";
import getPineconeClient from "@/lib/pineconeClient";
import { Pinecone } from "@pinecone-database/pinecone";
import { Document as LangDocument } from "@langchain/core/documents";

// Using Node.js built-in assert for testing
import assert from 'assert';

async function testPDFAndVectorStore() {
  try {
    // Test PDF parsing
    console.info("Chunking document");
    const docs = await getPDFChunks();
    assert(Array.isArray(docs), 'Docs should be an array');
    assert(docs.length > 0, 'Docs should not be empty');
    assert(docs[0] instanceof LangDocument, 'First doc should be a LangDocument');
    
    console.info("Init Pinecone client");
    const pc = await getPineconeClient();
    assert(pc instanceof Pinecone, 'Pinecone client should be an instance of Pinecone');

    console.info("Embedding and storing docs");
    await embedAndStoreDocs(pc, docs);
    console.log('Test passed successfully');
  } catch (error) {
    console.error('Test failed:', error);
    throw error;
  }
}

// Run the test
await testPDFAndVectorStore();
