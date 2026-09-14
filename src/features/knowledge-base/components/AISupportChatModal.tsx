"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Bot,
  Send,
  X,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  Loader2,
  AlertCircle,
  MessageSquare,
  Trash2,
  HelpCircle,
  ChevronRight,
  LifeBuoy,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { sendAIChatMessage, sendAIFeedback } from "../api/support-ai-api";

interface ChatMessageItem {
  id: string;
  role: "user" | "assistant";
  content: string;
  rated?: boolean;
  llmUnavailable?: boolean;
  relatedQuestions?: string[];
}

export interface AIHumanSupportEscalationContext {
  subject?: string;
  description?: string;
  otherDetails?: string;
}

interface AISupportChatModalProps {
  hackathonId?: string;
  organizationId?: string;
  onOpenHumanSupport?: (context?: AIHumanSupportEscalationContext) => void;
}

const FormattedChatMessageContent: React.FC<{ content: string }> = ({ content }) => {
  if (!content) return null;

  const lines = content.split("\n").map((l) => l.trim()).filter(Boolean);
  const elements: React.ReactNode[] = [];
  let currentListItems: string[] = [];

  const flushList = () => {
    if (currentListItems.length > 0) {
      const listKey = `ol-${elements.length}`;
      elements.push(
        <ol key={listKey} className="my-2.5 space-y-2.5 list-none pl-0">
          {currentListItems.map((item, idx) => (
            <li
              key={idx}
              className="flex items-start gap-2.5 text-slate-200 leading-relaxed text-xs sm:text-sm text-justify"
            >
              <span className="font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md shrink-0 text-xs mt-0.5 select-none">
                {idx + 1}.
              </span>
              <span className="flex-1 min-w-0 text-slate-200">{item}</span>
            </li>
          ))}
        </ol>
      );
      currentListItems = [];
    }
  };

  lines.forEach((line, idx) => {
    const numMatch = line.match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      currentListItems.push(numMatch[2]);
    } else {
      flushList();
      elements.push(
        <p key={`p-${idx}`} className="text-slate-200 leading-relaxed text-xs sm:text-sm my-1 text-justify">
          {line}
        </p>
      );
    }
  });

  flushList();

  return <div className="space-y-1.5">{elements}</div>;
};

export const AISupportChatModal: React.FC<AISupportChatModalProps> = ({
  hackathonId,
  organizationId,
  onOpenHumanSupport,
}) => {
  const t = useTranslations("KnowledgeBase");
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading, isOpen]);

  // Listen to custom window event triggered by KBAssistantBanner or floating triggers
  useEffect(() => {
    const handleOpenEvent = () => {
      setIsOpen(true);
      setTimeout(() => inputRef.current?.focus(), 150);
    };

    window.addEventListener("open-ai-support-assistant", handleOpenEvent);
    return () => {
      window.removeEventListener("open-ai-support-assistant", handleOpenEvent);
    };
  }, []);

  const submitQuery = async (rawText: string) => {
    const queryText = rawText.trim();
    if (!queryText || loading) return;

    setErrorText(null);
    setQuestion("");

    const uniqueSeed = Math.random().toString(36).substring(2, 7);
    const userMessageId = `user-${Date.now()}-${uniqueSeed}`;
    
    setMessages((prev) => [...prev, { id: userMessageId, role: "user", content: queryText }]);
    setLoading(true);

    try {
      const response = await sendAIChatMessage({
        question: queryText,
        session_id: sessionId,
        hackathon_id: hackathonId,
        organization_id: organizationId,
      });

      setSessionId(response.session_id);
      const related = response.relatedQuestions || response.related_questions || [];

      setMessages((prev) => [
        ...prev,
        {
          id: response.message_id || `assistant-${Date.now()}-${uniqueSeed}`,
          role: "assistant",
          content: response.answer,
          llmUnavailable: response.llm_unavailable,
          relatedQuestions: related,
        },
      ]);
    } catch (err: any) {
      console.error("AI support chat error:", err);
      setErrorText("Unable to reach AI support assistant. Please try again.");
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}-${uniqueSeed}`,
          role: "assistant",
          content:
            "I'm temporarily unable to process your request. Please try again in a moment or check our published FAQs.",
          llmUnavailable: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    await submitQuery(question);
  };

  const handleFeedback = async (messageId: string, rating: number) => {
    try {
      await sendAIFeedback({ message_id: messageId, rating });
      setMessages((prev) =>
        prev.map((msg) => (msg.id === messageId ? { ...msg, rated: true } : msg))
      );
    } catch (err) {
      console.error("Failed to record feedback:", err);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setSessionId(undefined);
    setErrorText(null);
  };

  const buildEscalationContext = (): AIHumanSupportEscalationContext => {
    const lastUserQuery = [...messages].reverse().find((m) => m.role === "user")?.content || question || "";
    const conversationTranscript = messages
      .map((m) => `[${m.role === "user" ? "User" : "AI Assistant"}]:\n${m.content}`)
      .join("\n\n---\n\n");
    return {
      subject: lastUserQuery ? `Support Request: ${lastUserQuery.slice(0, 60)}` : "Support Request to Platform Admin",
      description: lastUserQuery || "I would like to escalate my support request to the Platform Admin.",
      otherDetails: conversationTranscript ? `AI Support Chat Conversation History:\n${conversationTranscript}` : undefined,
    };
  };

  return (
    <>
      {/* Floating Trigger Button (Bottom Right) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-[#0f6b5c] to-[#0b3c33] text-amber-300 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200 border border-emerald-500/30 group cursor-pointer"
          type="button"
          aria-label={t("askAiBtn")}
          title={t("askAiBtn")}
        >
          <div className="relative flex items-center justify-center">
            <Bot className="w-6 h-6 group-hover:rotate-12 transition-transform duration-200" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full" />
          </div>
        </button>
      )}

      {/* Chat Drawer / Modal Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end p-0 sm:p-6 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full sm:w-[440px] h-[85vh] sm:h-[620px] bg-slate-900 border border-slate-800 text-white rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden relative">
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-[#0e2b25] via-[#0f6b5c] to-[#0b3c33] border-b border-emerald-500/20 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-white/10 border border-white/20 text-amber-300">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-300 uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>RAG Support AI</span>
                  </div>
                  <h4 className="text-base font-bold text-white">
                    Innovation Hub Assistant
                  </h4>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {onOpenHumanSupport && (
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      onOpenHumanSupport(buildEscalationContext());
                    }}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-primary/25 hover:bg-primary/40 text-emerald-200 border border-emerald-500/30 text-xs font-medium transition-colors mr-1 cursor-pointer"
                    title="Human Support"
                    type="button"
                  >
                    <LifeBuoy className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="hidden sm:inline">Human Support</span>
                  </button>
                )}
                {messages.length > 0 && (
                  <button
                    onClick={handleClearChat}
                    className="p-2 text-emerald-200/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    title="Clear Conversation"
                    type="button"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-emerald-200/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  aria-label="Close Assistant"
                  type="button"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-950/60">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center px-4 space-y-3">
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    <MessageSquare className="w-8 h-8" />
                  </div>
                  <h5 className="text-base font-bold text-white">
                    {t("aiAssistantBannerTitle")}
                  </h5>
                  <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                    Ask me any question about hackathon guidelines, submission rules, category eligibility, or technical FAQs!
                  </p>
                  <div className="pt-2 flex flex-wrap gap-2 justify-center">
                    {[
                      "How do I submit a project?",
                      "What are the hackathon rules?",
                      "Can I edit my team details?",
                    ].map((sample, idx) => (
                      <button
                        key={idx}
                        onClick={() => submitQuery(sample)}
                        className="text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 text-emerald-300 rounded-lg px-3 py-1.5 transition-colors"
                      >
                        {sample}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, idx) => (
                <div
                  key={msg.id ? `${msg.id}-${idx}` : `msg-${idx}`}
                  className={`flex gap-3 ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[82%] p-3.5 rounded-2xl text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-emerald-600 text-white rounded-br-xs shadow-sm"
                        : "bg-slate-800/90 text-slate-200 border border-slate-700/80 rounded-bl-xs shadow-sm"
                    }`}
                  >
                    <FormattedChatMessageContent content={msg.content} />

                    {/* Related Questions Component */}
                    {msg.role === "assistant" && msg.relatedQuestions && msg.relatedQuestions.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-slate-700/60">
                        <p className="text-xs font-semibold text-emerald-400 mb-2 flex items-center gap-1.5">
                          <HelpCircle className="w-3.5 h-3.5" />
                          Related Questions
                        </p>
                        <div className="flex flex-col gap-1.5">
                          {msg.relatedQuestions.map((qText, qIdx) => (
                            <button
                              key={qIdx}
                              type="button"
                              onClick={() => submitQuery(qText)}
                              className="text-left text-xs bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-emerald-300 hover:text-emerald-200 rounded-lg px-3 py-2 transition-all hover:border-emerald-500/50 flex items-center justify-between group cursor-pointer shadow-xs"
                            >
                              <span>{qText}</span>
                              <ChevronRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-emerald-400 shrink-0 ml-2" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Support Ticket Quick Action */}
                    {msg.role === "assistant" && onOpenHumanSupport && (msg.content.toLowerCase().includes("support ticket") || msg.content.toLowerCase().includes("ticket") || msg.llmUnavailable) && (
                      <div className="mt-2.5 pt-2 border-t border-slate-700/60">
                        <button
                          type="button"
                          onClick={() => {
                            setIsOpen(false);
                            onOpenHumanSupport(buildEscalationContext());
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/25 hover:bg-primary/40 text-emerald-200 border border-emerald-500/30 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          <LifeBuoy className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Submit Ticket to Platform Admin &rarr;</span>
                        </button>
                      </div>
                    )}

                    {/* Disclaimer / Warning indicator */}
                    {msg.role === "assistant" && (
                      <div className="mt-2.5 pt-2 border-t border-slate-700/50 flex items-center justify-between text-xs text-slate-400">
                        <span className="text-[11px] text-slate-400 italic">
                          AI-generated response
                        </span>


                        {!msg.rated && !msg.llmUnavailable && (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleFeedback(msg.id, 5)}
                              className="p-1 hover:text-emerald-400 transition-colors"
                              title="Helpful"
                              type="button"
                            >
                              <ThumbsUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleFeedback(msg.id, 1)}
                              className="p-1 hover:text-rose-400 transition-colors"
                              title="Not helpful"
                              type="button"
                            >
                              <ThumbsDown className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}

                        {msg.rated && (
                          <span className="text-[11px] text-emerald-400">
                            Thanks for feedback!
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex gap-3 items-center text-slate-400 text-xs">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-amber-300 flex items-center justify-center shrink-0">
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                  </div>
                  <span className="text-slate-400 italic">
                    Retrieving knowledge base chunks & generating answer...
                  </span>
                </div>
              )}

              {errorText && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorText}</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form
              onSubmit={handleSend}
              className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2 shrink-0"
            >
              <input
                ref={inputRef}
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask support AI..."
                disabled={loading}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/60 transition-colors disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={loading || !question.trim()}
                className="p-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-xs transition-colors disabled:opacity-40 disabled:hover:bg-emerald-600"
                aria-label="Send Question"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
