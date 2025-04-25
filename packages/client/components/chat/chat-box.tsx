"use client";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, User, Loader2, Send } from "lucide-react";
import React, { useRef } from "react";
import { Button } from "../ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../ui/card";
import { Input } from "../ui/input";
import { CustomMarkdown } from "../ui/mark-down";
import { useChat } from "@ai-sdk/react";
import { useSearchParams } from "next/navigation";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
}

const ChatBox: React.FC = () => {
  const params = useSearchParams();
  const chatId = params.get("chat-id") || undefined;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize useChat with fetched messages
  const { messages, input, handleInputChange, handleSubmit, status } = useChat({
    api: "http://localhost:3001/api/chat",
    id: chatId || "",
  });

  return (
    <Card className="w-full border-zinc-800 bg-zinc-950/50 backdrop-blur-sm shadow-2xl text-white col-start-3 col-span-10 row-span-12 h-full">
      <CardHeader className="border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <Bot className="text-purple-400" size={25} />
          <div>
            <CardTitle className="text-white">The Thing</CardTitle>
            <CardDescription>Your mysterious AI companion</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 h-full">
        <ScrollArea className="px-4">
          {messages.length === 0 && !chatId ? (
            <div className="flex h-full items-center justify-center text-center p-8">
              <div className="space-y-2">
                <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-medium">
                  What would you like to know?
                </h3>
                <p className="text-sm text-muted-foreground">
                  Try asking: "What's the weather today?" or "Tell me a joke!"
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => {
                const isUser = message.role === "user";
                return (
                  <div
                    key={message.id}
                    className={cn(
                      "flex w-fit max-w-[80%] flex-col gap-2",
                      isUser ? "ml-auto" : "mr-auto"
                    )}
                  >
                    <div
                      className={cn(
                        "flex items-center gap-2",
                        isUser && "flex-row-reverse"
                      )}
                    >
                      <Avatar
                        className={cn(
                          "h-8 w-8",
                          isUser ? "bg-primary" : "bg-secondary"
                        )}
                      >
                        <AvatarFallback>
                          {isUser ? (
                            <User className="h-4 w-4 text-black" />
                          ) : (
                            <Bot className="h-4 w-4 text-purple-600" />
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={cn(
                          "rounded-lg px-4 py-2 max-w-full",
                          isUser
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-secondary-foreground"
                        )}
                      >
                        <CustomMarkdown content={message.content} />
                      </div>
                    </div>
                  </div>
                );
              })}
              {status === "submitted" && (
                <div className="flex w-max max-w-[80%] flex-col gap-2 mr-auto">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8 bg-secondary">
                      <AvatarFallback>
                        <Bot className="h-4 w-4 text-purple-600" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="rounded-lg bg-secondary text-secondary-foreground px-4 py-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>
      </CardContent>
      <CardFooter className="border-t border-zinc-800">
        <form
          onSubmit={handleSubmit}
          className="flex w-full items-center space-x-2"
        >
          <label htmlFor="message" className="sr-only">
            Message
          </label>
          <Input
            id="message"
            placeholder="Type your message..."
            className="flex-1"
            value={input}
            onChange={handleInputChange}
            disabled={status === "submitted"}
          />
          <Button
            type="submit"
            size="icon"
            disabled={status === "submitted" || !input.trim()}
          >
            {status === "submitted" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
};

export default ChatBox;
