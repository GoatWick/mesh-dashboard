import { motion } from "framer-motion";
import type { MeshNode } from "@/hooks/useMeshtastic";
import { SignalMeter } from "./SignalMeter";

interface NodeCardProps {
  node: MeshNode;
  isSelected: boolean;
  onClick: () => void;
  index: number;
}

function formatLastSeen(timestamp: number): string {
  if (!timestamp) return "NEVER";
  const seconds = Math.floor(Date.now() / 1000 - timestamp);
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
}

function getLastSeenColor(timestamp: number): string {
  if (!timestamp) return "text-signal-red";
  const minutes = (Date.now() / 1000 - timestamp) / 60;
  if (minutes < 5) return "text-signal-green";
  if (minutes < 15) return "text-signal-amber";
  return "text-signal-red";
}

function getBatteryColor(level?: number): string {
  if (level === undefined) return "text-muted-foreground";
  if (level > 50) return "text-signal-green";
  if (level > 20) return "text-signal-amber";
  return "text-signal-red";
}

export function NodeCard({ node, isSelected, onClick, index }: NodeCardProps) {
  const lastSeenStr = formatLastSeen(node.lastHeard);
  const lastSeenColor = getLastSeenColor(node.lastHeard);
  const battColor = getBatteryColor(node.deviceMetrics?.batteryLevel);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        delay: index * 0.03,
        duration: 0.2,
        ease: [0.05, 0.7, 0.1, 1.0],
      }}
      onClick={onClick}
      className={`tactical-card-hover cursor-pointer ${
        isSelected ? "border-primary" : ""
      }`}
      style={isSelected ? { boxShadow: "0 0 10px hsl(142 70% 50% / 0.15)" } : {}}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-1.5 mb-2">
        <div className="flex items-center gap-2">
          <span className="font-label text-muted-foreground">NODE_ID</span>
          <span className="font-data text-xs text-primary">
            {node.user?.id ?? `!${node.num.toString(16)}`}
          </span>
        </div>
        <SignalMeter snr={node.snr} />
      </div>

      {/* Name */}
      {node.user && (
        <div className="mb-2">
          <span className="font-data text-xs text-foreground">
            {node.user.longName}
          </span>
          <span className="font-label text-muted-foreground ml-2">
            [{node.user.shortName}]
          </span>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-4 gap-2">
        <div>
          <div className="font-label text-muted-foreground">[SNR]</div>
          <div className={`font-data text-xs ${node.snr > 5 ? "text-signal-green" : node.snr > 0 ? "text-signal-amber" : "text-signal-red"}`}>
            {node.snr.toFixed(1)}dB
          </div>
        </div>
        <div>
          <div className="font-label text-muted-foreground">[BATT]</div>
          <div className={`font-data text-xs ${battColor}`}>
            {node.deviceMetrics?.batteryLevel !== undefined
              ? `${node.deviceMetrics.batteryLevel}%`
              : "---"}
          </div>
        </div>
        <div>
          <div className="font-label text-muted-foreground">[VOLT]</div>
          <div className="font-data text-xs text-foreground">
            {node.deviceMetrics?.voltage !== undefined
              ? `${node.deviceMetrics.voltage.toFixed(2)}V`
              : "---"}
          </div>
        </div>
        <div>
          <div className="font-label text-muted-foreground">[SEEN]</div>
          <div className={`font-data text-xs ${lastSeenColor}`}>
            {lastSeenStr}
          </div>
        </div>
      </div>

      {/* Hops */}
      {node.hopsAway !== undefined && node.hopsAway > 0 && (
        <div className="mt-1.5 font-label text-muted-foreground">
          HOPS: <span className="text-foreground">{node.hopsAway}</span>
          {node.viaMqtt && <span className="text-signal-amber ml-2">[MQTT]</span>}
        </div>
      )}
    </motion.div>
  );
}
