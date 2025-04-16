"use client";

// components
import { ChatInput } from "@/components/ChatInput";
// component && types
import { ChatBox, Interaction } from "@/components/ChatBox";

// built-in methods
import { useState } from "react";

export default function Home() {
  // messages update asynchronously
  const [messages, setMessages] = useState<Interaction[]>([]);

  const handleNewMessage = async (userMessage: string) => {
    
    const newMessage: Interaction = {
      user: userMessage,
      agent: "Loading..." // Temporary loading state
    };
    // collect prev Interaction, same fn as append
    setMessages(prev => [...prev, newMessage]);

    try {
      const response = await fetch('/api/ts-engine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
      });
      const data = await response.json();
      // TODO: test conversation cache update
      // if (userMessage === "throw error") throw new Error;
      
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1].agent = data.body;
        return updated;
      });
    } catch (error) {
      // can only revert to prev state with server wcache
      console.error('Error:', error);
    }
  };

  return (
    <main className="relative flex flex-col h-screen items-center bg-black">
      {/* flex-1 to grow with messages */}
      <div className="flex-1 w-full overflow-hidden">
        <ChatBox messages={messages} />
      </div>
      <div className="w-full">
        <ChatInput onSendMessage={handleNewMessage} />
      </div>
    </main>
  );
}
