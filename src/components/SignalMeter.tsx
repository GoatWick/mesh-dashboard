import { motion } from "framer-motion";

interface SignalMeterProps {
  snr: number;
  className?: string;
}

export function SignalMeter({ snr, className = "" }: SignalMeterProps) {
  // SNR ranges: -20 to +10 typically
  // Map to 0-5 bars
  const bars = Math.max(0, Math.min(5, Math.round((snr + 20) / 6)));

  const getBarColor = (index: number) => {
    if (index >= bars) return "bg-muted";
    if (bars >= 4) return "bg-signal-green";
    if (bars >= 2) return "bg-signal-amber";
    return "bg-signal-red";
  };

  return (
    <div className={`flex items-end gap-px ${className}`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          initial={{ height: 0 }}
          animate={{ height: `${(i + 1) * 3 + 2}px` }}
          transition={{ delay: i * 0.03, duration: 0.15, ease: [0.05, 0.7, 0.1, 1.0] }}
          className={`w-[3px] ${getBarColor(i)}`}
        />
      ))}
    </div>
  );
}
