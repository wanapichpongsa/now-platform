import { ChatInput } from "@/components/ChatInput";
import { ChatBox } from "@/components/ChatBox";

export default function Home() {
    const allMessages = [{
      user: "Hello",
      agent: "Hi there! You look amazing! dlfja;sljf;ldjklaslfjsajfladkljflsdjklf;jasl;fjlsafdsjjafdfkasfjsadjfkladsjljdls;ajkl;sjl;adfla;sdjflasdjflkadsjfl;ajl;fjl;dsjl;faj;lsjdfskldjfklajl;k;ls"
    },
    {
      user: "How are you?",
      agent: "I'm good, thank you!"
    }]
  return (
    <main className="flex flex-col h-screen items-center relative bg-black">
      <ChatBox messages={allMessages} />
      <ChatInput />
    </main>
  );
}
