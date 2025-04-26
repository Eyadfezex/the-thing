import { Request, Response } from "express";
import { streamChatResponse } from "../services/chat.service";
import { CoreMessage } from "ai";

/**
 * Handles chat requests by streaming AI responses
 *
 * @param req - Express request object containing messages in the body
 * @param res - Express response object used to stream back the AI response
 *
 * @remarks
 * This handler:
 * 1. Extracts messages from the request body
 * 2. Sets up a timeout of 25 seconds for the AI response
 * 3. Streams the AI response back to the client using Server-Sent Events
 * 4. Handles timeout and other errors appropriately
 *
 * @throws {Error} Returns 504 status if AI response times out
 * @throws {Error} Returns 500 status for other AI-related errors
 */
export async function chatHandler(req: Request, res: Response) {
  const { messages } = req.body as { messages: CoreMessage[] };
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);
  try {
    const result = await streamChatResponse(messages);

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    result.pipeDataStreamToResponse(res);
  } catch (error: any) {
    const isTimeout = error?.name === "AbortError";
    res.status(isTimeout ? 504 : 500).json({
      error: isTimeout ? "AI response timeout" : "AI error",
    });
  } finally {
    clearTimeout(timeout);
  }
}
