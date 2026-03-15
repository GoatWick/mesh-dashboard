import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import type { MeshMessage, MeshNode } from "@/hooks/useMeshtastic";

interface CommsStreamProps {
  messages: MeshMessage[];
  nodes: MeshNode[];
  myNodeNum: number | null;
  onSendMessage: (text: string, to?: number) => void;
}

function getNodeName(nodes: MeshNode[], num: number): string {
  const node = nodes.find((n) => n.num === num);
  if (node?.user) return node.user.shortName;
  return `!${num.toString(16)}`;
}

function formatTime(epoch: number): string {
  const d = new Date(epoch * 1000);
  return d.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export function CommsStream({ messages, nodes, myNodeNum, onSendMessage }: CommsStreamProps) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    onSendMessage(trimmed);
    setInput("");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <span className="font-label text-muted-foreground">
          COMMS_STREAM // {messages.length} MSG
        </span>
        <span className="font-label text-muted-foreground">
          CH: 0 // BROADCAST
        </span>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3 space-y-0.5"
        style={{ scrollBehavior: "auto" }}
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <span className="font-data text-sm">AWAITING_TRAFFIC...</span>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isLocal = msg.from === myNodeNum;
            const fromName = getNodeName(nodes, msg.from);
            const toName = msg.to === 0xffffffff ? "^ALL" : getNodeName(nodes, msg.to);

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02, duration: 0.1 }}
                className="font-data text-xs leading-5"
              >
                <span className="text-muted-foreground">[{formatTime(msg.time)}]</span>
                {" "}
                <span className={isLocal ? "text-primary" : "text-signal-amber"}>
                  {fromName}
                </span>
                <span className="text-muted-foreground">→{toName}</span>
                {" "}
                <span className="text-foreground">{msg.text}</span>
                {msg.rxSnr !== undefined && (
                  <span className="text-muted-foreground ml-1">
                    [{msg.rxSnr.toFixed(1)}dB]
                  </span>
                )}
              </motion.div>
            );
          })
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border p-2 flex gap-2">
        <div className="flex-1 flex items-center gap-2 tactical-card">
          <span className="font-label text-primary">TX&gt;</span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="TYPE_MESSAGE..."
            className="flex-1 bg-transparent font-data text-xs text-foreground placeholder:text-muted-foreground outline-none"
          />
        </div>
        <button
          onClick={handleSend}
          disabled={!input.trim()}
          className="font-label px-4 py-1.5 border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors duration-50 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          SEND
        </button>
      </div>
    </div>
  );
}
