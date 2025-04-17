"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cacheFile } from "@/lib/redis";

interface ChatInputProps {
  onSendMessage: (message: string) => Promise<void>;
}

export function ChatInput({ onSendMessage }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleSendMessage = async (): Promise<void> =>  {
    if (!message && !selectedFile) return;
    setIsUploading(true);
    // if (selectedFile) parseFile(selectedFile)
    setMessage("");
    await onSendMessage(message);
    setIsUploading(false);
  };

  const router = useRouter();
  // useEffect for continuous promise runtime
  useEffect(() => {
    // dilemma: need to use client API asynchronously
    const handleFileUpload = async () => {
      try { 
        if (selectedFile) {
          const base64String = await new Promise<string>((resolve) => {
            const reader = new FileReader(); // client API
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(selectedFile);
          });
          const fileKey = await cacheFile(base64String);
          console.log(`cached file: ${fileKey}`);
          router.push(`/document/${fileKey}`);
        }
      } catch (error) {
        setSelectedFile(null);
        console.error('File upload failed:', error);
      }
    };
    handleFileUpload();
  }, [selectedFile, router]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setSelectedFile(file || null);
  }

  return (
    <div className="relative flex gap-2 bottom-0 py-4 px-24 w-full">
      <Input value={message} placeholder="Ask anything" onChange={(e) => setMessage(e.target.value)} />
      {/* TODO: make button faded when !message */}
      <div className="flex">
        {/* file not in enum type? */}
        <input
          className="pl-4 pt-1.5 bg-zinc-100 rounded-lg" 
          id="promptFile" 
          type="file" 
          onChange={handleFileSelect}
          disabled={isUploading}
          />
        <Button className="ml-2 bg-blue-700 " onClick={handleSendMessage}>Send</Button>
      </div>
    </div>
  );
}