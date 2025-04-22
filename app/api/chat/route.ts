import { google } from "@ai-sdk/google";
import { streamText, UIMessage } from "ai";
import { createChatSession, saveMessageToDB } from "@/lib/db";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const {
      messages,
      id: incomingChatId,
    }: {
      messages: UIMessage[];
      id?: string;
      role: string;
      content: string;
    } = await req.json();

    // Input validation
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Invalid request parameters" },
        { status: 400 }
      );
    }

    // 1. Create a session if needed
    const chatId = incomingChatId || (await createChatSession());

  
    // 3. Generate the AI response with timeout handling
    const result = await Promise.race([
      streamText({
        model: google("gemini-1.5-flash"),
        system: `You are a helpful assistant. You are a 20s old man. Your name is "the thing".`,
        messages,
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("AI response timeout")), 25000)
      ),
    ]);

  // 2. Save the message with error handling
  try {
    const message = messages[messages.length - 1];
    await saveMessageToDB(chatId, message.content, message.role);
  } catch (dbError) {
    console.error("Database error:", dbError);
    return NextResponse.json(
      { error: "Failed to save message" },
      { status: 500 }
    );
  }



    // 4. Return the stream + chatId for the client to keep using
    const response = (result as { toDataStreamResponse: () => Response }).toDataStreamResponse();
    response.headers.set("x-chat-id", chatId);
    response.headers.set("Cache-Control", "no-cache");

    return response;
  } catch (error) {
    console.error("Error in POST handler:", error);
    const errorMessage = error instanceof Error ? error.message : "Something went wrong";
    return NextResponse.json(
      { error: errorMessage },
      { status: error instanceof Error && error.message === "AI response timeout" ? 504 : 500 }
    );
  }
}
