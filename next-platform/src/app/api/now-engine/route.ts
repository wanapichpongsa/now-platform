"use server";
import { NextRequest, NextResponse } from "next/server";

/*
API routes that we need:
Proxy: Redis server cache
1. Load pre-existing conversation states.
3. Send and return chat input messages.
5. File buffer local storage and download.

Condition: Modular & distinct i.e., seperate files/functions, explicit purpose
How to do it: Make distinct slugs for distinct roles. Naming it now-engine was a rookie mistake

Skepticism about this API route design:
1. Not explicit in what it does
*/

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const endpoint = "http://127.0.0.1:8080/now-engine"; // python backend
    const { message } = await req.json(); // parse message from json req
    const response = await fetch(endpoint, {
    method: "POST",
    headers: {"Accept": "application/json"},
    body: message, // <- I believe this is a problem because body would be a nested JSON?
    });
    if (!response.ok) throw new Error("Python backend failure");
    
    // no need to await response.json? (Think architecture diagram)

    return NextResponse.json(
      { reply: response },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Error in chat API: ' + error }, 
      { status: 500 } // perhaps be proxy for python message as 500 means absolute failure?
    );
  }
}