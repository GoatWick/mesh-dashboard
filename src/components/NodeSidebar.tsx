import { useState } from "react";
import { motion } from "framer-motion";
import type { MeshNode } from "@/hooks/useMeshtastic";
import { NodeCard } from "./NodeCard";

interface NodeSidebarProps {
  nodes: MeshNode[];
  selectedNode: MeshNode | null;
  onSelectNode: (node: MeshNode) => void;
}

type SortKey = "lastHeard" | "snr" | "name";

export function NodeSidebar({ nodes, selectedNode, onSelectNode }: NodeSidebarProps) {
  const [sortBy, setSortBy] = useState<SortKey>("lastHeard");

  const sorted = [...nodes].sort((a, b) => {
    if (sortBy === "lastHeard") return (b.lastHeard || 0) - (a.lastHeard || 0);
    if (sortBy === "snr") return b.snr - a.snr;
    return (a.user?.longName ?? "").localeCompare(b.user?.longName ?? "");
  });

  return (
    <div className="w-80 min-w-[320px] border-r border-border bg-background flex flex-col h-full overflow-hidden">
      {/* Sort Controls */}
      <div className="flex items-center gap-1 px-3 py-2 border-b border-border">
        <span className="font-label text-muted-foreground mr-2">SORT:</span>
        {(["lastHeard", "snr", "name"] as SortKey[]).map((key) => (
          <button
            key={key}
            onClick={() => setSortBy(key)}
            className={`font-label px-2 py-0.5 border transition-colors duration-50 ${
              sortBy === key
                ? "border-primary text-primary"
                : "border-border text-muted-foreground hover:text-foreground hover:border-foreground"
            }`}
          >
            {key === "lastHeard" ? "SEEN" : key.toUpperCase()}
          </button>
        ))}
        <span className="ml-auto font-label text-muted-foreground">
          {nodes.length} ACTIVE
        </span>
      </div>

      {/* Node List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {sorted.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center h-full text-muted-foreground"
          >
            <span className="font-data text-sm">SCANNING_MESH...</span>
            <div className="w-32 h-px bg-primary/30 mt-4 relative overflow-hidden">
              <div className="absolute inset-0 bg-primary animate-scanline" />
            </div>
          </motion.div>
        ) : (
          sorted.map((node, i) => (
            <NodeCard
              key={node.num}
              node={node}
              isSelected={selectedNode?.num === node.num}
              onClick={() => onSelectNode(node)}
              index={i}
            />
          ))
        )}
      </div>
    </div>
  );
}
