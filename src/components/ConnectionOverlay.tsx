import { useState } from "react";
import { motion } from "framer-motion";
import type { ConnectionStatus, ConnectionConfig } from "@/hooks/useMeshtastic";

interface ConnectionOverlayProps {
  status: ConnectionStatus;
  error: string | null;
  config: ConnectionConfig;
  onRetry: () => void;
  onUpdateConfig: (config: ConnectionConfig) => void;
}

export function ConnectionOverlay({ status, error, config, onRetry, onUpdateConfig }: ConnectionOverlayProps) {
  const [ip, setIp] = useState(config.ip);
  const [protocol, setProtocol] = useState<"http" | "https">(config.protocol);

  if (status === "LINK_ACQUIRED") return null;

  const handleConnect = () => {
    onUpdateConfig({ ip: ip.trim(), protocol });
  };

  const isError = status === "LINK_LOST";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`fixed inset-0 z-50 flex items-center justify-center ${
        isError ? "bg-background/95" : "bg-background"
      }`}
    >
      <div className="tactical-card p-8 max-w-md w-full">
        {status === "CONNECTING" && (
          <>
            <div className="font-hero text-foreground mb-4 text-center">INITIALIZING</div>
            <div className="font-data text-sm text-muted-foreground mb-4 text-center">
              FETCHING_DATA_STREAM...
            </div>
            <div className="w-48 h-px bg-muted mx-auto relative overflow-hidden">
              <motion.div
                className="absolute inset-y-0 w-16 bg-primary"
                animate={{ x: ["-100%", "300%"] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              />
            </div>
            <div className="font-label text-muted-foreground mt-4 text-center">
              TARGET: {protocol.toUpperCase()}://{ip}
            </div>
          </>
        )}

        {(status === "DISCONNECTED" || status === "LINK_LOST") && (
          <>
            <div className={`font-hero mb-4 text-center ${isError ? "text-signal-red glow-red" : "text-foreground"}`}>
              {isError ? "LINK_LOST" : "MESH_CTRL"}
            </div>

            {isError && error && (
              <div className="font-label text-signal-red text-center mb-2">
                ERR: {error}
              </div>
            )}

            {isError && (
              <div className="font-label text-muted-foreground text-center mb-4">
                CORS may block requests from remote origins.
                Run locally for direct device access.
              </div>
            )}

            {!isError && (
              <div className="font-label text-muted-foreground text-center mb-6">
                MESHTASTIC TACTICAL DASHBOARD
              </div>
            )}

            <div className="space-y-3 mb-4">
              <div>
                <label className="font-label text-muted-foreground block mb-1">[PROTOCOL]</label>
                <div className="flex gap-1">
                  {(["http", "https"] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setProtocol(p)}
                      className={`font-label px-3 py-1.5 border flex-1 transition-colors duration-50 ${
                        protocol === p
                          ? "border-primary text-primary"
                          : "border-border text-muted-foreground hover:text-foreground hover:border-foreground"
                      }`}
                    >
                      {p.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-label text-muted-foreground block mb-1">[DEVICE_IP]</label>
                <div className="tactical-card flex items-center gap-2">
                  <span className="font-label text-muted-foreground">{protocol}://</span>
                  <input
                    type="text"
                    value={ip}
                    onChange={(e) => setIp(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleConnect()}
                    placeholder="192.168.1.89"
                    className="flex-1 bg-transparent font-data text-sm text-foreground placeholder:text-muted-foreground outline-none"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleConnect}
              disabled={!ip.trim()}
              className={`w-full font-label px-6 py-2.5 border transition-colors duration-50 disabled:opacity-30 ${
                isError
                  ? "border-signal-red text-signal-red hover:bg-signal-red hover:text-foreground"
                  : "border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              }`}
            >
              {isError ? "RETRY_CONNECTION" : "CONNECT"}
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
}
