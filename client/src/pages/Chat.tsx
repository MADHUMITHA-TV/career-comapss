import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Send, Loader2, MessageSquare, User, Bot, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { ChatMessage as ChatMessageType } from "@shared/schema";

const suggestedQuestions = [
  "What skills should I learn for data science roles?",
  "Am I ready for frontend developer positions?",
  "How can I improve my resume for tech jobs?",
  "What certifications are valuable for software engineers?",
  "How do I prepare for technical interviews?",
  "What projects should I build to showcase my skills?",
];

function ChatBubble({ message }: { message: ChatMessageType }) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}
      data-testid={`chat-message-${message.id}`}
    >
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          isUser ? "bg-primary" : "bg-muted"
        }`}
      >
        {isUser ? (
          <User className="h-4 w-4 text-primary-foreground" />
        ) : (
          <Bot className="h-4 w-4 text-muted-foreground" />
        )}
      </div>
      <div
        className={`max-w-2xl rounded-2xl px-4 py-3 ${
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted"
        }`}
      >
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  );
}

function LoadingBubble() {
  return (
    <div className="flex gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
        <Bot className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="max-w-2xl rounded-2xl bg-muted px-4 py-3">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm text-muted-foreground">Thinking...</span>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ onQuestionClick }: { onQuestionClick: (q: string) => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-6">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <MessageSquare className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="mb-2 font-display text-xl font-semibold">Career Q&A Assistant</h3>
      <p className="mb-8 max-w-md text-center text-muted-foreground">
        Ask any career-related question and get personalized guidance for your job search journey.
      </p>
      <div className="w-full max-w-2xl">
        <p className="mb-4 flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Sparkles className="h-4 w-4" />
          Try asking:
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {suggestedQuestions.map((question, i) => (
            <Button
              key={i}
              variant="outline"
              className="h-auto justify-start whitespace-normal text-left text-sm"
              onClick={() => onQuestionClick(question)}
              data-testid={`suggested-question-${i}`}
            >
              {question}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

function MessagesSkeleton() {
  return (
    <div className="space-y-4 p-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className={`flex gap-3 ${i % 2 === 0 ? "flex-row-reverse" : ""}`}>
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className={`h-16 ${i % 2 === 0 ? "w-48" : "w-64"} rounded-2xl`} />
        </div>
      ))}
    </div>
  );
}

export default function Chat() {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { data: messages, isLoading } = useQuery<ChatMessageType[]>({
    queryKey: ["/api/chat/history"],
  });

  const sendMutation = useMutation({
    mutationFn: async (query: string) => {
      const response = await apiRequest("POST", "/api/query", { query });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/history"] });
    },
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, sendMutation.isPending]);

  function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    const trimmedInput = input.trim();
    if (!trimmedInput || sendMutation.isPending) return;

    setInput("");
    sendMutation.mutate(trimmedInput);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  function handleQuestionClick(question: string) {
    setInput(question);
    textareaRef.current?.focus();
  }

  const hasMessages = messages && messages.length > 0;

  return (
    <div className="flex h-full flex-col">
      <div className="border-b p-6">
        <h1 className="font-display text-3xl font-bold tracking-tight">Career Q&A</h1>
        <p className="text-muted-foreground">
          Ask questions about your career journey and get personalized advice.
        </p>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        {isLoading ? (
          <MessagesSkeleton />
        ) : hasMessages ? (
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <ChatBubble key={message.id} message={message} />
              ))}
              {sendMutation.isPending && <LoadingBubble />}
            </div>
          </ScrollArea>
        ) : (
          <EmptyState onQuestionClick={handleQuestionClick} />
        )}

        <Card className="mx-4 mb-4 mt-auto">
          <CardContent className="p-3">
            <form onSubmit={handleSubmit} className="flex gap-3">
              <Textarea
                ref={textareaRef}
                placeholder="Ask a career question..."
                className="min-h-10 max-h-32 resize-none border-0 focus-visible:ring-0"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={sendMutation.isPending}
                data-testid="input-chat"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || sendMutation.isPending}
                data-testid="button-send"
              >
                {sendMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
