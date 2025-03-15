import { ChatInput } from "@/components/ChatInput";
import { ChatBox } from "@/components/ChatBox";

export default function Home() {
  return (
    <main className="flex flex-col h-screen items-center relative bg-black">
      <ChatBox messages={[]} />
      <ChatInput />
    </main>
  );
}
