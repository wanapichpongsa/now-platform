"use client";
import Navbar from "@/components/Navbar";
import { getCachedFile } from "@/lib/redis";
import { useState, useEffect } from "react";

/*
Pain point: Very difficult to highlight
*/

export default function DocumentTab({ params }: { params: Promise<{ key: string }> }) {
  const [fileKey, setFileKey] = useState<string>("")
  const [fileData, setFileData] = useState<string | null>(null);
  // fetch waterfall error if direct from client component
  // react hooks to handle SSR and CSR conflicts?
  useEffect(() => {
    const fileData = async () => { 
      const { key } = await params;
      setFileKey(key)
      const base64string = await getCachedFile(fileKey)
      setFileData(base64string);
    };
    fileData();
  }, [params]);
  
  return (
    <main className="pt-24 px-24 relative flex flex-col h-screen items-center justify-center bg-black">
      <Navbar />
      <div className="w-full overflow-hidden">
        <div className="mb-12">
          {fileData && (
            <iframe 
              src={fileData}
              className="w-full h-[calc(90vh-4rem)]"
              title="Document Viewer"
            />
          )}
        </div>
      </div>
    </main>
  );
}