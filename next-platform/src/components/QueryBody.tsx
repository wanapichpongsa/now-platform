"use client";

export function QueryBody({ message }: { message: string }) {
  return (
    <div className="flex justify-end mt-10 p-4 w-[70%] ml-auto"> {/* would rather use ml-auto instead of parent div justify-end unless want associate granular containers with keys*/}
      <p className="break-words bg-neutral-800 rounded-2xl px-4 py-2">{message}</p> {/* Need to specify w otherwise overflow wrap won't work properly */}
    </div>
  );
}