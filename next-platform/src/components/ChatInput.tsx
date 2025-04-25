"use client";

import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { postPdfFormdataToText } from "@/test/fastAPI";

interface ChatInputProps {
  onSendMessage: (message: string) => Promise<void>;
}

export function ChatInput({ onSendMessage }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  // TODO: flowchart: 
  const handleSendMessage = async (): Promise<void> =>  {
    if (!message && !selectedFile) return;
    setIsUploading(true);
    // if (selectedFile) parseFile(selectedFile)
    setMessage("");
    await onSendMessage(message);
    setIsUploading(false);
  };

  const router = useRouter();
  // Use component lifecycle method (interaction with DOM, loading event listeners) with params(effectCallback, DependencyList <- reload after first round with component mount)
  // if declaring Element GETTERS then need to cleanup.
  // but what optimisations were needed such that they made this method?

  // Purpose is to: "Synchronise a component with an external system"
  // Do I even need a useEffect if component renders DOM first.
  useEffect(() => {
    // dilemma: need to use client API asynchronously
    const fileInput: HTMLInputElement | null = document.querySelector('input[type="file"]');

    if (!fileInput) return;

    // Define the event listener function
    const handleFileChange = async (): Promise<void> => {
      const file = fileInput.files?.[0];
      if (file) {
        console.log("File selected!");
        const fr = new FileReader();
        fr.onload = async () => {
          const dataURLResult = fr.result as string;
          const [dataURL, base64String] = dataURLResult.split(',');
          
          const mimeMatch = dataURL.match(/^data:(.*?);base64/) || "Wrong Regex"; // regex more explicit than split. Funfact: gets context non-greedily
          const mimeType = mimeMatch[1]
          const fileType = mimeType.split("/")[1]; // will crash if matchRegex is undefined
          console.log("fileType " + fileType);
          // keep prefix application || image for effective search in db e.g., filter application/* or image/*
          if (mimeType === "application/pdf") {
            const formData = new FormData();
            formData.append('file', file);
            console.log("formData: " + formData.toString()); // need to decode from binary
            const text = await postPdfFormdataToText(formData);
            console.log(text);
            // usestate update a JSX parse preview component
            
          } else {
            console.warn("No handler for this type yet")
          }
        };
        fr.readAsDataURL(file);
      }
    };

    // Add the event listener
    fileInput.addEventListener("change", handleFileChange);

    // Cleanup function to remove the event listener
    // Why are cleanup functions returned?
    return () => {
      fileInput.removeEventListener("change", handleFileChange);
    };
  }, []);

  return (
    <div className="flex flex-col items-start">
      <div className="relative flex gap-2 bottom-0 py-4 px-24 w-full">
        <input 
          className="pl-4 bg-zinc-100 rounded-lg w-full"
          id="promptMessage"
          value={message} 
          placeholder="Ask anything" 
          onChange={(e) => setMessage(e.target.value)} 
          disabled={isUploading}
        />
        {/* TODO: make button faded when !message */}
        <div className="flex">
          {/* file not in enum type? */}
          <input
            className="pl-4 pt-1.5 bg-zinc-100 rounded-lg" 
            id="promptFile" 
            type="file"
            accept="*" // not images yet
            disabled={isUploading}
            />
          <Button className="ml-2 bg-blue-700 " onClick={handleSendMessage}>Send</Button>
        </div>
      </div>
    </div>
  );
}