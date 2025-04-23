"use server";

import { env } from "./env";
import { Pinecone } from "@pinecone-database/pinecone";
// langchain methods
import { PineconeStore } from "@langchain/pinecone";
import { OpenAIEmbeddings } from "@langchain/openai";
// type
import { Document as LangDocument } from "@langchain/core/documents";

export default async function embedAndStoreDocs(
  pc: Pinecone, 
  docs: LangDocument[]
): Promise<void> {
  try {
  const embeddings = new OpenAIEmbeddings({
    apiKey: env.OPENAI_API_KEY,
    model: "text-embedding-3-small",
  });

  const pcIndex = pc.Index("now-tech-1");

  // refactorable since need to query via .similaritySearch() || asRetriever().
  const vectorStore = await PineconeStore.fromExistingIndex(
    embeddings, 
    {
      pineconeIndex: pcIndex,
      maxConcurrency: 5, // Each batch is 1000 vectors.
    }
  );
  /* 
    default ids are 'doc' + docNum + '#' + pageNum
    accessed .listPagination() 
    SEE: https://docs.pinecone.io/guides/data/list-record-ids
    OR UUID by default
  */
  await vectorStore.addDocuments(docs);

  // delay 30s before queryable
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  await delay(30000);

    console.info(`Successful embed upload of ${docs[0].metadata.source}`);

  } catch (error) {
    console.error(error);
    throw new Error(`Failed embed upload of ${docs[0].metadata.source}`)
  }
}