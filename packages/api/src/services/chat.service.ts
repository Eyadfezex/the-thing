import { google } from "@ai-sdk/google";
import { CoreMessage, streamText } from "ai";

export async function streamChatResponse(messages: CoreMessage[]) {
  return await streamText({
    model: google("gemini-1.5-flash"),
    system: `You are a helpful assistant named "The Thing". You're in your 20s, casually professional, and speak in a natural human tone. Avoid catchphrases or overly playful language. Focus on clarity and usefulness.`,
    messages,
  });
}
