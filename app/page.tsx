"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Markdown from "react-markdown";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { CustomMarkdown } from "@/components/ui/mark-down";

export default function ChatbotPage() {
  const { messages, input, handleInputChange, handleSubmit, status } = useChat({
    api: "/api/chat",
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (!mounted) return null;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-zinc-900  to-gray-900  p-4 ">
      <Card className="w-full max-w-4xl border-zinc-800 bg-zinc-950/50 backdrop-blur-sm shadow-2xl text-white">
        <CardHeader className="border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Bot className="text-purple-400" size={25} />
            <div>
              <CardTitle className="text-white">The Thing</CardTitle>
              <CardDescription>Your mysterious AI companion</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[600px] px-4">
            {messages.length === 0 ? (
              <div className="flex h-full items-center justify-center text-center p-8">
                <div className="space-y-2">
                  <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-medium">
                    What would you like to know?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Ask me questions, request information, or just chat!
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 ">
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
        <CardFooter className="border-t border-zinc-800 p-4">
          <form
            onSubmit={handleSubmit}
            className="flex w-full items-center space-x-2"
          >
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
    </div>
  );
}
