"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function ChatInput() {
  const [message, setMessage] = useState("");
  const handleSendMessage = async () => {
    const apiRoute = '/api/chat';
    console.log(message);
    // Need to import POST from api/chat/route.ts?
    const response = await fetch(apiRoute, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ message }),
    });
    const data = await response.json();
    console.log(data);
    if (!response.ok) throw new Error("api/chat route failure: " + data.error);
    setMessage("");
  };

  return (
    <div className="flex fixed bottom-0 py-4 px-6 w-full">
      <Input value={message} placeholder="Ask anything" onChange={(e) => setMessage(e.target.value)} />
      <Button className="ml-2 bg-blue-700 " onClick={handleSendMessage}>Send</Button>
    </div>
  );
}