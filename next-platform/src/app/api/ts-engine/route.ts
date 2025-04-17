"use server";

import ollama from 'ollama/browser';
import { NextRequest, NextResponse } from 'next/server';
import { cacheMessage } from '@/lib/redis';

// define params on client side
// Shold be NextRequest && NextResponse
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { userInput } = await req.json();

    await cacheMessage(userInput);
    
    const aiResponse = await conversationAgent("deepseek-r1:8b", userInput);
    
    await cacheMessage(aiResponse);

    return NextResponse.json({
      status: 200,
      body: aiResponse
    });
  } catch (error) {
    throw error;
  };

  async function conversationAgent(
    model: string,
    userPrompt: string,
    attachment?: string
  ): Promise<string> {
    if (attachment) userPrompt += `\nattachment:\n${attachment}`;
    interface llmPrompt {role: string, content: string}
    const prompts: llmPrompt[] = [];
    // takes too long for testing
    /*
    prompts.push({ 
      role: 'system', 
      content: "You are a helpful data transformation agent that classifies bank statement invoices to spending categories." 
    });
    */
   prompts.push({role: 'system', content: 'You are a helpful assistant'});
    prompts.push({ 
      role: 'user', 
      content: userPrompt 
    });
    
    // I don't think ollama errors are caught (went through to client side)
    const response = await ollama.chat({
      model: model,
      messages: prompts,
    })
    return response.message.content
  };
}


