import { motion } from "framer-motion";
import type { MeshNode } from "@/hooks/useMeshtastic";
import { SignalMeter } from "./SignalMeter";

interface NodeDetailPanelProps {
  node: MeshNode;
}

export function NodeDetailPanel({ node }: NodeDetailPanelProps) {
  const metrics = node.deviceMetrics;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.05, 0.7, 0.1, 1.0] }}
      className="border-t border-border bg-background p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="font-hero text-primary">
            {node.user?.id ?? `!${node.num.toString(16)}`}
          </span>
          {node.user && (
            <span className="font-data text-sm text-muted-foreground">
              // {node.user.longName}
            </span>
          )}
        </div>
        <SignalMeter snr={node.snr} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <TelemetryCell label="SNR" value={`${node.snr.toFixed(2)}dB`} status={node.snr > 5 ? "green" : node.snr > 0 ? "amber" : "red"} />
        <TelemetryCell label="BATTERY" value={metrics?.batteryLevel !== undefined ? `${metrics.batteryLevel}%` : "---"} status={metrics?.batteryLevel ? (metrics.batteryLevel > 50 ? "green" : metrics.batteryLevel > 20 ? "amber" : "red") : "neutral"} />
        <TelemetryCell label="VOLTAGE" value={metrics?.voltage !== undefined ? `${metrics.voltage.toFixed(2)}V` : "---"} />
        <TelemetryCell label="CH_UTIL" value={metrics?.channelUtilization !== undefined ? `${metrics.channelUtilization.toFixed(1)}%` : "---"} />
        <TelemetryCell label="AIR_TX" value={metrics?.airUtilTx !== undefined ? `${metrics.airUtilTx.toFixed(1)}%` : "---"} />
        <TelemetryCell label="UPTIME" value={metrics?.uptimeSeconds !== undefined ? formatUptime(metrics.uptimeSeconds) : "---"} />

        {node.position && (
          <>
            <TelemetryCell label="LAT" value={node.position.latitude.toFixed(6)} />
            <TelemetryCell label="LON" value={node.position.longitude.toFixed(6)} />
            <TelemetryCell label="ALT" value={`${node.position.altitude}m`} />
          </>
        )}

        {node.user && (
          <>
            <TelemetryCell label="HW_MODEL" value={node.user.hwModel ?? "---"} />
            <TelemetryCell label="SHORT_NAME" value={node.user.shortName ?? "---"} />
          </>
        )}

        {node.hopsAway !== undefined && (
          <TelemetryCell label="HOPS" value={String(node.hopsAway)} />
        )}
      </div>
    </motion.div>
  );
}

function TelemetryCell({
  label,
  value,
  status = "neutral",
}: {
  label: string;
  value: string;
  status?: "green" | "amber" | "red" | "neutral";
}) {
  const valueColor = {
    green: "text-signal-green",
    amber: "text-signal-amber",
    red: "text-signal-red",
    neutral: "text-foreground",
  }[status];

  return (
    <div className="tactical-card">
      <div className="font-label text-muted-foreground mb-1">[{label}]</div>
      <div className={`font-data text-sm ${valueColor}`}>{value}</div>
    </div>
  );
}

function formatUptime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 24) return `${Math.floor(h / 24)}d${h % 24}h`;
  return `${h}h${m}m`;
}
