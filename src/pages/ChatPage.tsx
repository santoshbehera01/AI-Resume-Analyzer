import { useState, useRef, useEffect, useCallback } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Send, Bot, User, Sparkles, Copy, Check, Trash2,
  FileText, Lightbulb, Target, MessageSquare, BriefcaseBusiness,
  Plus, Search, Mic, MicOff, Pencil, Download, X,
} from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { useChatStorage, type Message } from "@/hooks/useChatStorage";
import { useVoiceInput } from "@/hooks/useVoiceInput";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/career-chat`;

const quickActions = [
  { label: "Improve my resume", icon: FileText, prompt: "Review my resume and give me specific, actionable improvements for each section. Focus on making bullet points stronger with metrics and action verbs." },
  { label: "Suggest skills to add", icon: Lightbulb, prompt: "Based on current industry trends, what technical and soft skills should I add to my resume to be more competitive? Give specific examples of how to showcase them." },
  { label: "Fix experience section", icon: Target, prompt: "Help me rewrite my experience section with stronger action verbs, quantifiable achievements, and better ATS optimization. Provide before/after examples." },
  { label: "Interview prep", icon: BriefcaseBusiness, prompt: "Generate 10 likely interview questions for my target role and provide structured answers using the STAR method. Include behavioral and technical questions." },
];

function getResumeContext(): { resumeText?: string; jobDescription?: string } | undefined {
  try {
    const resume = localStorage.getItem("ats-last-resume");
    const jd = localStorage.getItem("ats-last-jd");
    if (resume || jd) return { resumeText: resume || undefined, jobDescription: jd || undefined };
  } catch {}
  return undefined;
}

async function streamChat({
  messages, resumeContext, onDelta, onDone, signal,
}: {
  messages: Message[];
  resumeContext?: { resumeText?: string; jobDescription?: string };
  onDelta: (text: string) => void;
  onDone: () => void;
  signal?: AbortSignal;
}) {
  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ messages, resumeContext }),
    signal,
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || `Error ${resp.status}`);
  }
  if (!resp.body) throw new Error("No response body");

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  let done = false;

  while (!done) {
    const { done: readerDone, value } = await reader.read();
    if (readerDone) break;
    buf += decoder.decode(value, { stream: true });
    let idx: number;
    while ((idx = buf.indexOf("\n")) !== -1) {
      let line = buf.slice(0, idx);
      buf = buf.slice(idx + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (line.startsWith(":") || !line.trim()) continue;
      if (!line.startsWith("data: ")) continue;
      const json = line.slice(6).trim();
      if (json === "[DONE]") { done = true; break; }
      try {
        const parsed = JSON.parse(json);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) onDelta(content);
      } catch { buf = line + "\n" + buf; break; }
    }
  }
  onDone();
}

const ChatPage = () => {
  const {
    chats, activeChat, activeChatId, setActiveChatId,
    createChat, updateMessages, deleteChat, renameChat, searchChats,
  } = useChatStorage();

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [showChatList, setShowChatList] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const messages = activeChat?.messages ?? [];

  const handleVoiceResult = useCallback((text: string) => {
    setInput((prev) => (prev ? prev + " " + text : text));
  }, []);
  const voice = useVoiceInput(handleVoiceResult);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    let chatId = activeChatId;
    if (!chatId) chatId = createChat();

    const userMsg: Message = { role: "user", content: text.trim() };
    const newMessages = [...messages, userMsg];
    updateMessages(chatId!, newMessages);
    setInput("");
    setIsLoading(true);
    setIsStreaming(true);

    let assistantSoFar = "";
    const upsert = (chunk: string) => {
      assistantSoFar += chunk;
      const updated = [...newMessages];
      const last = updated[updated.length - 1];
      if (last?.role === "assistant") {
        updated[updated.length - 1] = { ...last, content: assistantSoFar };
      } else {
        updated.push({ role: "assistant", content: assistantSoFar });
      }
      updateMessages(chatId!, updated);
    };

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      await streamChat({
        messages: newMessages,
        resumeContext: getResumeContext(),
        onDelta: upsert,
        onDone: () => { setIsLoading(false); setIsStreaming(false); },
        signal: controller.signal,
      });
    } catch (e: any) {
      if (e.name !== "AbortError") {
        console.error(e);
        toast.error(e.message || "Failed to get response");
      }
      setIsLoading(false);
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  };

  const copyMessage = (idx: number) => {
    navigator.clipboard.writeText(messages[idx].content);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
    toast.success("Copied to clipboard!");
  };

  const handleNewChat = () => {
    if (abortRef.current) abortRef.current.abort();
    setIsLoading(false);
    setIsStreaming(false);
    createChat();
  };

  const handleClearChat = () => {
    if (!activeChatId) return;
    if (abortRef.current) abortRef.current.abort();
    updateMessages(activeChatId, []);
    setIsLoading(false);
    setIsStreaming(false);
    toast.success("Chat cleared");
  };

  const exportChat = () => {
    if (!activeChat) return;
    const text = activeChat.messages
      .map((m) => `${m.role === "user" ? "You" : "AI"}: ${m.content}`)
      .join("\n\n---\n\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeChat.title.replace(/[^a-zA-Z0-9]/g, "_")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Chat exported!");
  };

  const startRename = (chatId: string, title: string) => {
    setEditingChatId(chatId);
    setEditTitle(title);
  };

  const commitRename = () => {
    if (editingChatId && editTitle.trim()) {
      renameChat(editingChatId, editTitle.trim());
    }
    setEditingChatId(null);
  };

  const filteredChats = searchQuery ? searchChats(searchQuery) : chats;
  const hasContext = !!getResumeContext();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex min-w-0">
          {/* Chat History Sidebar */}
          <div className={`${showChatList ? "flex" : "hidden"} md:flex flex-col w-64 border-r border-border bg-secondary/30 flex-shrink-0`}>
            <div className="p-3 border-b border-border space-y-2">
              <Button onClick={handleNewChat} className="w-full gap-2 transition-all duration-200 hover:scale-[1.02]" size="sm">
                <Plus className="h-4 w-4" /> New Chat
              </Button>
              <div className="relative focus-glow rounded-md">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search chats…"
                  className="pl-8 h-8 text-xs bg-background"
                />
              </div>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                {filteredChats.length === 0 && (
                  <div className="text-center py-8 px-4">
                    <MessageSquare className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">No chats yet</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-1">Start a conversation below</p>
                  </div>
                )}
                {filteredChats.map((chat) => (
                  <div
                    key={chat.id}
                    className={`group flex items-center gap-1.5 rounded-lg px-3 py-2.5 cursor-pointer transition-all duration-200 text-sm ${
                      chat.id === activeChatId
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "hover:bg-muted text-muted-foreground"
                    }`}
                    onClick={() => {
                      setActiveChatId(chat.id);
                      setShowChatList(false);
                    }}
                  >
                    <MessageSquare className="h-3.5 w-3.5 flex-shrink-0" />
                    {editingChatId === chat.id ? (
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onBlur={commitRename}
                        onKeyDown={(e) => e.key === "Enter" && commitRename()}
                        className="h-6 text-xs flex-1"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <span className="truncate flex-1 text-xs">{chat.title}</span>
                    )}
                    <div className="hidden group-hover:flex items-center gap-0.5">
                      <button
                        onClick={(e) => { e.stopPropagation(); startRename(chat.id, chat.title); }}
                        className="p-1 rounded-md hover:bg-muted transition-colors"
                      >
                        <Pencil className="h-3 w-3" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteChat(chat.id); }}
                        className="p-1 rounded-md hover:bg-destructive/10 hover:text-destructive transition-colors"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col min-w-0">
            <header className="h-14 flex items-center border-b border-border bg-background sticky top-0 z-50 px-4 gap-3">
              <SidebarTrigger />
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden h-8 w-8"
                onClick={() => setShowChatList(!showChatList)}
              >
                <MessageSquare className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary/10">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <span className="font-semibold text-sm truncate text-foreground">
                  {activeChat?.title || "AI Career Assistant"}
                </span>
              </div>
              <div className="ml-auto flex items-center gap-1">
                {messages.length > 0 && (
                  <>
                    <Button variant="ghost" size="sm" onClick={exportChat} className="text-muted-foreground h-8 px-2 hover:text-foreground transition-colors">
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleClearChat} className="text-muted-foreground hover:text-destructive h-8 px-2 transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </>
                )}
              </div>
            </header>

            <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full">
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">
                {messages.length === 0 && (
                  <div className="flex-1 flex flex-col items-center justify-center py-20 space-y-8">
                    <div className="text-center space-y-4">
                      <div className="inline-flex p-5 rounded-2xl bg-primary/10 mb-2">
                        <Sparkles className="h-10 w-10 text-primary" />
                      </div>
                      <h2 className="text-2xl md:text-3xl font-bold gradient-text">AI Career Assistant</h2>
                      <p className="text-muted-foreground max-w-md text-sm leading-relaxed">
                        Ask me anything about your resume, career, interview prep, or job search strategy.
                      </p>
                      {hasContext && (
                        <p className="text-xs text-primary flex items-center justify-center gap-1.5 bg-primary/5 rounded-full px-4 py-1.5 mx-auto w-fit">
                          <FileText className="h-3 w-3" /> Resume context loaded — answers will be personalized
                        </p>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                      {quickActions.map((action) => (
                        <button
                          key={action.label}
                          onClick={() => sendMessage(action.prompt)}
                          className="glass-card p-4 text-left hover:border-primary/30 group"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/15 transition-colors">
                              <action.icon className="h-4 w-4 text-primary" />
                            </div>
                            <span className="text-sm font-medium text-foreground">{action.label}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map((msg, i) => {
                  const isLastAssistant = msg.role === "assistant" && i === messages.length - 1 && isStreaming;
                  return (
                    <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}>
                      {msg.role === "assistant" && (
                        <div className="flex-shrink-0 mt-1">
                          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Bot className="h-4 w-4 text-primary" />
                          </div>
                        </div>
                      )}
                      <div className={`relative group max-w-[80%] ${msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-2xl rounded-br-sm px-4 py-3"
                        : "bg-secondary border border-border rounded-2xl rounded-bl-sm px-4 py-3"
                      }`}>
                        {msg.role === "assistant" ? (
                          <div className={`prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 ${isLastAssistant ? "streaming-cursor" : ""}`}>
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                          </div>
                        ) : (
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                        )}
                        {msg.role === "assistant" && msg.content && !isStreaming && (
                          <button
                            onClick={() => copyMessage(i)}
                            className="absolute -bottom-3 right-2 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-background border border-border rounded-md p-1 hover:bg-muted"
                          >
                            {copiedIdx === i
                              ? <Check className="h-3 w-3 text-primary" />
                              : <Copy className="h-3 w-3 text-muted-foreground" />
                            }
                          </button>
                        )}
                      </div>
                      {msg.role === "user" && (
                        <div className="flex-shrink-0 mt-1">
                          <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center">
                            <User className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                  <div className="flex gap-3 justify-start animate-fade-in">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                    <div className="bg-secondary border border-border rounded-2xl rounded-bl-sm px-4 py-3">
                      <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                        <div className="flex gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:0ms]" />
                          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:150ms]" />
                          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:300ms]" />
                        </div>
                        <span className="text-xs">AI is thinking…</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Sticky Input */}
              <div className="border-t border-border p-4 bg-background sticky bottom-0">
                <div className="flex gap-2 items-end focus-glow rounded-xl p-1">
                  {voice.supported && (
                    <Button
                      variant={voice.isListening ? "destructive" : "outline"}
                      size="icon"
                      className="h-10 w-10 shrink-0 rounded-lg transition-all duration-200"
                      onClick={voice.toggle}
                    >
                      {voice.isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    </Button>
                  )}
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={voice.isListening ? "Listening…" : "Ask about your resume, career, or interview prep…"}
                    className="min-h-[40px] max-h-[120px] resize-none bg-secondary/50 border-border rounded-lg text-sm"
                    rows={1}
                  />
                  <Button
                    onClick={() => sendMessage(input)}
                    disabled={!input.trim() || isLoading}
                    size="icon"
                    className="h-10 w-10 shrink-0 rounded-lg transition-all duration-200 hover:scale-105"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground/60 text-center mt-2">
                  Press Enter to send · Shift+Enter for new line
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default ChatPage;
