import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface ChatViewProps {
  conversationId: Id<"conversations"> | null;
  onNewChat: () => void;
}

export function ChatView({ conversationId, onNewChat }: ChatViewProps) {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messages = useQuery(
    api.messages.list,
    conversationId ? { conversationId } : "skip"
  ) ?? [];

  const createMessage = useMutation(api.messages.create);
  const updateTitle = useMutation(api.conversations.updateTitle);
  const chat = useAction(api.ai.chat);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !conversationId || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setError(null);
    setIsLoading(true);

    try {
      // Save user message
      await createMessage({
        conversationId,
        role: "user",
        content: userMessage,
      });

      // Update conversation title if first message
      if (messages.length === 0) {
        const title = userMessage.slice(0, 50) + (userMessage.length > 50 ? "..." : "");
        await updateTitle({ id: conversationId, title });
      }

      // Get AI response
      const response = await chat({
        messages: [
          ...messages.map((m: { role: string; content: string }) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          })),
          { role: "user" as const, content: userMessage },
        ],
        systemPrompt: `You are MacForge AI, an expert assistant for Mac app development. You help developers with:
- Swift and SwiftUI code
- Xcode project configuration
- macOS frameworks and APIs
- App architecture and design patterns
- Debugging and performance optimization
- App Store submission process
- Code review and best practices

Be concise but thorough. Provide code examples when helpful. Use markdown formatting for code blocks.`,
      });

      // Save assistant message
      await createMessage({
        conversationId,
        role: "assistant",
        content: response,
      });
    } catch (err) {
      setError("Failed to get response. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!conversationId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="max-w-lg text-center animate-fade-in">
          <div className="w-20 h-20 rounded-[22px] bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-500/25 animate-pulse-glow">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25" />
            </svg>
          </div>
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-white mb-3">
            Welcome to MacForge AI
          </h2>
          <p className="text-zinc-400 mb-8 max-w-md mx-auto">
            Your AI-powered assistant for Mac app development. Get help with Swift, SwiftUI, Xcode, and everything macOS.
          </p>
          <button
            onClick={onNewChat}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-xl transition-all shadow-lg shadow-blue-500/25"
          >
            Start a Conversation
          </button>

          {/* Quick prompts */}
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              "Help me set up a new SwiftUI project",
              "Debug my Core Data implementation",
              "Best practices for macOS menu bar apps",
              "Optimize my app for Apple Silicon",
            ].map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => {
                  onNewChat();
                  // The input will be handled after conversation is created
                }}
                className="p-4 text-left text-sm text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 hover:border-white/10 transition-all"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-[calc(100dvh-56px)] lg:h-screen">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.length === 0 && !isLoading && (
            <div className="text-center py-12 animate-fade-in">
              <p className="text-zinc-500">Send a message to start the conversation</p>
            </div>
          )}

          {messages.map((message: { _id: string; role: string; content: string }, idx: number) => (
            <div
              key={message._id}
              className={`flex gap-4 animate-fade-in ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              {message.role === "assistant" && (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex-shrink-0 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
                  </svg>
                </div>
              )}
              <div
                className={`max-w-[85%] md:max-w-[75%] p-4 rounded-2xl ${
                  message.role === "user"
                    ? "bg-blue-500/20 text-white ml-auto"
                    : "glass text-zinc-200"
                }`}
              >
                <div className="prose prose-invert prose-sm max-w-none">
                  <MessageContent content={message.content} />
                </div>
              </div>
              {message.role === "user" && (
                <div className="w-8 h-8 rounded-lg bg-zinc-700 flex-shrink-0 flex items-center justify-center">
                  <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                  </svg>
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-4 animate-fade-in">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex-shrink-0 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
                </svg>
              </div>
              <div className="glass p-4 rounded-2xl">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 bg-zinc-400 rounded-full typing-dot" />
                  <span className="w-2 h-2 bg-zinc-400 rounded-full typing-dot" />
                  <span className="w-2 h-2 bg-zinc-400 rounded-full typing-dot" />
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="flex justify-center animate-fade-in">
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-white/5 p-4 md:p-6 glass-dark">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about Mac app development..."
              disabled={isLoading}
              className="flex-1 px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-5 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/25"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function MessageContent({ content }: { content: string }) {
  // Simple markdown-like rendering for code blocks
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("```")) {
          const match = part.match(/```(\w+)?\n?([\s\S]*?)```/);
          if (match) {
            const [, lang, code] = match;
            return (
              <pre key={i} className="bg-black/30 rounded-lg p-4 overflow-x-auto my-3">
                <code className={`text-sm text-zinc-300 ${lang ? `language-${lang}` : ""}`}>
                  {code.trim()}
                </code>
              </pre>
            );
          }
        }
        // Handle inline code
        const inlineParts = part.split(/(`[^`]+`)/g);
        return (
          <span key={i}>
            {inlineParts.map((inline, j) => {
              if (inline.startsWith("`") && inline.endsWith("`")) {
                return (
                  <code key={j} className="bg-white/10 px-1.5 py-0.5 rounded text-sm text-blue-300">
                    {inline.slice(1, -1)}
                  </code>
                );
              }
              return <span key={j} className="whitespace-pre-wrap">{inline}</span>;
            })}
          </span>
        );
      })}
    </>
  );
}
