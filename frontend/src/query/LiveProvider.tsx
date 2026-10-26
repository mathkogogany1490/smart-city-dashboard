import { useQueryClient } from "@tanstack/react-query";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { resolveWsUrl } from "../api/client";
import type { ComplaintItem } from "../api/types";

type LiveStatus = "connecting" | "open" | "closed";

type LiveValue = {
  status: LiveStatus;
  events: ComplaintItem[];
};

const LiveContext = createContext<LiveValue | null>(null);

export function LiveProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<LiveStatus>("connecting");
  const [events, setEvents] = useState<ComplaintItem[]>([]);

  useEffect(() => {
    let socket: WebSocket | null = null;
    let stopped = false;
    let timer = 0;

    const connect = () => {
      setStatus("connecting");
      socket = new WebSocket(resolveWsUrl());
      socket.onopen = () => setStatus("open");
      socket.onclose = () => {
        setStatus("closed");
        if (!stopped) timer = window.setTimeout(connect, 2000);
      };
      socket.onmessage = (message) => {
        const payload = JSON.parse(message.data) as { type?: string; complaint?: ComplaintItem };
        if (payload.type !== "complaint.created" || !payload.complaint) return;
        const complaint = payload.complaint;
        setEvents((current) => [complaint, ...current].slice(0, 8));
        void queryClient.invalidateQueries({ queryKey: ["complaints"] });
        void queryClient.invalidateQueries({ queryKey: ["district"] });
      };
    };

    connect();
    return () => {
      stopped = true;
      window.clearTimeout(timer);
      socket?.close();
    };
  }, [queryClient]);

  const value = useMemo(() => ({ status, events }), [status, events]);
  return <LiveContext.Provider value={value}>{children}</LiveContext.Provider>;
}

export function useLive() {
  const value = useContext(LiveContext);
  if (!value) throw new Error("실시간 연결 상태가 없습니다.");
  return value;
}
