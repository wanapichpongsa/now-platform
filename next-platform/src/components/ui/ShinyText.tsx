"use client";
// import { clsx } from "clsx";
// ways to dynamically return different elements?

export function ShinyText({text, element}: {text: string, element: string}) {
  switch (element) {
    case "h1":
      return <h1 className="text-6xl font-bold relative inline-block animate-shine text-transparent bg-clip-text bg-gradient-to-l from-zinc-400 via-white to-zinc-400 bg-[length:200%_100%]">{text}</h1>;
    case "h2":
      return<h2 className="text-4xl font-bold relative inline-block animate-shine text-transparent bg-clip-text bg-gradient-to-l from-zinc-400 via-white to-zinc-400 bg-[length:200%_100%]">{text}</h2>;
  }
}