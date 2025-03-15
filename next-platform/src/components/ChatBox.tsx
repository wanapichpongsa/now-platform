"use client";
import { QueryBody } from "./QueryBody";
import { ResponseBody } from "./ResponseBody";


interface Interactions {
  user: string;
  agent: string;
}

type Messages = {
  messages: Interactions[];
}

export function ChatBox({ messages }: Messages) {
  if (messages.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-4 max-w-lg">
          <h2 className="text-2xl font-bold text-zinc-700 dark:text-zinc-300">Welcome to AI Chat Assistant</h2>
          <p className="text-zinc-600 dark:text-zinc-400">Start a conversation by typing a message below.</p>
        </div>
      </div>
    )
  }
  return (
    <div className="flex flex-col w-full h-full p-8 text-zinc-200 text-md"> {/* Maybe use gap instead of mt */}
      {messages.map((message, index) => (
        <div key={index}>
          <QueryBody message={message.user} />
          <ResponseBody message={message.agent} />
        </div>
      ))}
    </div>
  );
}