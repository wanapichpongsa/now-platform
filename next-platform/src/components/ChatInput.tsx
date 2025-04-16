"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface ChatInputProps {
  onSendMessage: (message: string) => Promise<void>;
}

export function ChatInput({ onSendMessage }: ChatInputProps) {
  const [message, setMessage] = useState("");

  const handleSendMessage = async (): Promise<void> =>  {
    if (!message) return;
    setMessage("");
    await onSendMessage(message);
  };

  return (
    <div className="relative flex bottom-0 py-4 px-24 w-full">
      <Input value={message} placeholder="Ask anything" onChange={(e) => setMessage(e.target.value)} />
      {/* TODO: make button faded when !message */}
      <Button className="ml-2 bg-blue-700 " onClick={handleSendMessage}>Send</Button>
    </div>
  );
}