"use server";

/* 
1. Transmission from client to filesystem? Or as buffer to server handlers?
2. Pdf-to-text is very hard rn, but pdf-to-vector should be fine?

langchain document_loaders: https://js.langchain.com/docs/integrations/document_loaders/file_loaders/pdf/

pdftotextjs --layout option to preserve layout. Adobe works but paid.
Source: https://www.reddit.com/r/node/comments/186y7y0/looking_for_a_good_pdfparser_to_extract_text_any/
*/

// import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf"; // 76.76KB
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters"; // 77.69KB
// type
import { Document as LangDocument } from "@langchain/core/documents";

/*
TODO: Once we have an in-app directory

const directoryLoader = new DirectoryLoader(process.env.PDF_DIRECTORY!, {
  ".pdf": (path: string) => new PDFLoader(path),
});

const directoryDocs = await directoryLoader.load();
*/

export async function getPDFChunks(): Promise<LangDocument[]> {
  try {
  const bankStatementPath = process.env.PDF_PATH!;

  // make fn && try catch
  const loader = new PDFLoader(bankStatementPath); // can {parsedItemSeperator: "",} for no spaces
  const docs = await loader.load(); // also has .metadata()

  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  const chunkedDocs = await textSplitter.splitDocuments(docs);
  
  return chunkedDocs

  } catch (error) {
    console.error("error: " + error);
    throw new Error("PDF chunking failed")
  }
}