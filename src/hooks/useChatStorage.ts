import { useState, useEffect, useCallback } from "react";

export type Message = { role: "user" | "assistant"; content: string };

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY = "ats-chats";

function loadChats(): Chat[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveChats(chats: Chat[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
}

function generateTitle(firstMessage: string): string {
  const cleaned = firstMessage.replace(/\n/g, " ").trim();
  return cleaned.length > 40 ? cleaned.slice(0, 40) + "…" : cleaned;
}

export function useChatStorage() {
  const [chats, setChats] = useState<Chat[]>(loadChats);
  const [activeChatId, setActiveChatId] = useState<string | null>(() => {
    const loaded = loadChats();
    return loaded.length > 0 ? loaded[0].id : null;
  });

  useEffect(() => {
    saveChats(chats);
  }, [chats]);

  const activeChat = chats.find((c) => c.id === activeChatId) ?? null;

  const createChat = useCallback(() => {
    const newChat: Chat = {
      id: crypto.randomUUID(),
      title: "New Chat",
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setChats((prev) => [newChat, ...prev]);
    setActiveChatId(newChat.id);
    return newChat.id;
  }, []);

  const updateMessages = useCallback(
    (chatId: string, messages: Message[]) => {
      setChats((prev) =>
        prev.map((c) => {
          if (c.id !== chatId) return c;
          const title =
            c.title === "New Chat" && messages.length > 0 && messages[0].role === "user"
              ? generateTitle(messages[0].content)
              : c.title;
          return { ...c, messages, title, updatedAt: Date.now() };
        })
      );
    },
    []
  );

  const deleteChat = useCallback(
    (chatId: string) => {
      setChats((prev) => {
        const next = prev.filter((c) => c.id !== chatId);
        if (activeChatId === chatId) {
          setActiveChatId(next.length > 0 ? next[0].id : null);
        }
        return next;
      });
    },
    [activeChatId]
  );

  const renameChat = useCallback((chatId: string, title: string) => {
    setChats((prev) =>
      prev.map((c) => (c.id === chatId ? { ...c, title, updatedAt: Date.now() } : c))
    );
  }, []);

  const searchChats = useCallback(
    (query: string) => {
      if (!query.trim()) return chats;
      const q = query.toLowerCase();
      return chats.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.messages.some((m) => m.content.toLowerCase().includes(q))
      );
    },
    [chats]
  );

  return {
    chats,
    activeChat,
    activeChatId,
    setActiveChatId,
    createChat,
    updateMessages,
    deleteChat,
    renameChat,
    searchChats,
  };
}
