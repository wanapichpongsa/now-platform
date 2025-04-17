"use client";
import Navbar from "@/components/Navbar";
import { getCachedFile } from "@/lib/redis";
import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea"

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
      const splitKey = key.split("-");
      if (splitKey[0] !== "FS" && !(parseInt(splitKey[1]))) {
        console.log(`key not detected: ${key}`);
        return
      };
      console.log("fileKey: " + key);
      setFileKey(key)
      const base64string = await getCachedFile(fileKey)
      setFileData(base64string);
    };
    fileData();
  }, [params]);
  // nav blocks scrollability of main
  return (
    <main className="relative flex flex-col h-screen items-center justify-center bg-black">
      <Navbar />
      <div className="overflow-y-auto py-24 px-24 relative flex flex-col w-full h-full gap-12">
        <div id="documentViewer" className="mt-24">
          {fileData && (
            <iframe 
              src={fileData}
              className="w-full h-[calc(90vh-4rem)]"
              title="Document Viewer"
            />
          )}
        </div>

        <div id="tableGui">
          <Textarea/>
        </div>
      </div>
    </main>
  );
}