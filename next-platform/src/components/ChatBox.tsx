"use client";
import { QueryBody } from "./QueryBody";
import { ResponseBody } from "./ResponseBody";
import { ShinyText } from "./ui/ShinyText";

export interface Interaction {
  user: string;
  agent: string;
}

type Messages = {
  messages: Interaction[];
}

export function ChatBox({ messages }: Messages) {
  // TODO: Make div and chat input relative so spacing is correct
  if (messages.length === 0) {
    return (
      <div id="loading" className="relative h-full flex items-center justify-center">
        <div className="text-center space-y-4 max-w-lg">
          <ShinyText text="now.tech" element="h2" />
          <p className="text-zinc-400">Start a conversation by typing a message below.</p>
        </div>
      </div>
    )
  }
  return (
    <div id="chatbox" className="relative flex flex-col w-full h-full overflow-y-auto p-8 text-zinc-200 text-md">
      {messages.map((message, index) => (
        <div key={index} className="flex flex-col gap-4">
          <QueryBody message={message.user} />
          <ResponseBody message={message.agent} />
        </div>
      ))}
    </div>
  );
}