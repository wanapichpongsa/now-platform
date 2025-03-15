"use client";

export function ResponseBody({ message }: { message: string }) {
  return (
    <div className="flex justify-start mt-10 p-4">
      <p className="break-words w-full">{message}</p> {/* Need to specify w otherwise overflow wrap won't work properly */}
    </div>
  );
}