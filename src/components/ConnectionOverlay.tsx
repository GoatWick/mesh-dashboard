import { motion } from "framer-motion";
import type { ConnectionStatus } from "@/hooks/useMeshtastic";

interface ConnectionOverlayProps {
  status: ConnectionStatus;
  error: string | null;
  onRetry: () => void;
}

export function ConnectionOverlay({ status, error, onRetry }: ConnectionOverlayProps) {
  if (status === "LINK_ACQUIRED") return null;

  const isError = status === "LINK_LOST";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`fixed inset-0 z-50 flex items-center justify-center ${
        isError ? "bg-signal-red/5" : "bg-background"
      }`}
      style={{ backdropFilter: isError ? "none" : undefined }}
    >
      <div className="tactical-card p-8 text-center max-w-md">
        {status === "CONNECTING" && (
          <>
            <div className="font-hero text-foreground mb-4">INITIALIZING</div>
            <div className="font-data text-sm text-muted-foreground mb-4">
              FETCHING_DATA_STREAM...
            </div>
            <div className="w-48 h-px bg-muted mx-auto relative overflow-hidden">
              <motion.div
                className="absolute inset-y-0 w-16 bg-primary"
                animate={{ x: ["-100%", "300%"] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              />
            </div>
            <div className="font-label text-muted-foreground mt-4">
              TARGET: 192.168.1.89
            </div>
          </>
        )}

        {status === "DISCONNECTED" && (
          <>
            <div className="font-hero text-muted-foreground mb-4">OFFLINE</div>
            <div className="font-data text-sm text-muted-foreground mb-4">
              NO_ACTIVE_CONNECTION
            </div>
            <button
              onClick={onRetry}
              className="font-label px-6 py-2 border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors duration-50"
            >
              CONNECT
            </button>
          </>
        )}

        {status === "LINK_LOST" && (
          <>
            <div className="font-hero text-signal-red glow-red mb-4">LINK_LOST</div>
            <div className="font-data text-sm text-signal-red mb-2">
              CONNECTION_REFUSED
            </div>
            {error && (
              <div className="font-label text-muted-foreground mb-4">
                ERR: {error}
              </div>
            )}
            <div className="font-label text-muted-foreground mb-4">
              DEVICE MAY BE UNREACHABLE AT 192.168.1.89
            </div>
            <button
              onClick={onRetry}
              className="font-label px-6 py-2 border border-signal-red text-signal-red hover:bg-signal-red hover:text-foreground transition-colors duration-50"
            >
              RETRY_CONNECTION
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
}
