"use server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {

    const endpoint = "http://127.0.0.1:8080/now-engine"; // python backend
    const { message } = await req.json(); // parse message from json req
    const response = await fetch(endpoint, {
    method: "POST",
    headers: {"Accept": "application/json"},
    body: message,
    });
    if (!response.ok) throw new Error("Python backend failure");

    return NextResponse.json(
      { success: true, reply: response },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Error in chat API: ' + error }, 
      { status: 500 } // perhaps be proxy for python message as 500 means absolute failure?
    );
  }
}