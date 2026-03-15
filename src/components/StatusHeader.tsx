import { motion } from "framer-motion";
import type { ConnectionStatus } from "@/hooks/useMeshtastic";

interface StatusHeaderProps {
  status: ConnectionStatus;
  nodeCount: number;
  lastUpdate: number | null;
  myNodeNum: number | null;
  deviceIp?: string;
}

export function StatusHeader({ status, nodeCount, lastUpdate, myNodeNum, deviceIp = "---" }: StatusHeaderProps) {
  const statusColor = {
    DISCONNECTED: "text-muted-foreground",
    CONNECTING: "text-signal-amber glow-amber",
    LINK_ACQUIRED: "text-signal-green glow-green",
    LINK_LOST: "text-signal-red glow-red",
  }[status];

  const statusDotColor = {
    DISCONNECTED: "bg-muted-foreground",
    CONNECTING: "bg-signal-amber animate-pulse-glow",
    LINK_ACQUIRED: "bg-signal-green animate-pulse-glow",
    LINK_LOST: "bg-signal-red animate-pulse-glow",
  }[status];

  const uptime = lastUpdate
    ? `${Math.floor((Date.now() - lastUpdate) / 1000)}s AGO`
    : "---";

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.05, 0.7, 0.1, 1.0] }}
      className="flex items-center justify-between border-b border-border bg-background px-4 py-2 h-12"
    >
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${statusDotColor}`} />
          <span className={`font-data text-xs ${statusColor}`}>
            RADIO_LINK: {status === "LINK_ACQUIRED" ? "ESTABLISHED" : status}
          </span>
        </div>

        <div className="h-4 w-px bg-border" />

        <span className="font-label text-muted-foreground">
          LOCAL_IP: <span className="text-foreground">{deviceIp}</span>
        </span>

        <div className="h-4 w-px bg-border" />

        <span className="font-label text-muted-foreground">
          FREQ: <span className="text-foreground">915MHz</span>
        </span>

        <div className="h-4 w-px bg-border" />

        <span className="font-label text-muted-foreground">
          ROLE: <span className="text-foreground">ROUTER</span>
        </span>
      </div>

      <div className="flex items-center gap-4">
        <span className="font-label text-muted-foreground">
          NODES: <span className="text-foreground">{nodeCount}</span>
        </span>

        <div className="h-4 w-px bg-border" />

        <span className="font-label text-muted-foreground">
          NODE_ID: <span className="text-primary">{myNodeNum ? `!${myNodeNum.toString(16)}` : "---"}</span>
        </span>

        <div className="h-4 w-px bg-border" />

        <span className="font-label text-muted-foreground">
          POLL: <span className="text-foreground">{uptime}</span>
        </span>
      </div>
    </motion.header>
  );
}
