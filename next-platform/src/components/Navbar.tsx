"use client";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 p-6 z-20">
      <div className="container mx-auto flex justify-center">
        <div className="flex items-center gap-3 bg-gray-800/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border border-gray-700/50">
          <a href="/" className="flex items-center gap-3 text-zinc-50">
              Home
          </a>
          <a href="/document" className="flex items-center gap-3 text-zinc-50">
            File
          </a>
        </div>
      </div>
    </nav>
  );
}