import { useState } from "react";
import { useMeshtastic, type MeshNode } from "@/hooks/useMeshtastic";
import { StatusHeader } from "@/components/StatusHeader";
import { NodeSidebar } from "@/components/NodeSidebar";
import { CommsStream } from "@/components/CommsStream";
import { NodeDetailPanel } from "@/components/NodeDetailPanel";
import { ConnectionOverlay } from "@/components/ConnectionOverlay";
import { NodeMap } from "@/components/NodeMap";

type CenterView = "MAP" | "COMMS";

const Index = () => {
  const mesh = useMeshtastic();
  const [selectedNode, setSelectedNode] = useState<MeshNode | null>(null);
  const [centerView, setCenterView] = useState<CenterView>("MAP");

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      <StatusHeader
        status={mesh.status}
        nodeCount={mesh.nodes.length}
        lastUpdate={mesh.lastUpdate}
        myNodeNum={mesh.myNodeNum}
        deviceIp={mesh.config.ip}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Left: Node List */}
        <NodeSidebar
          nodes={mesh.nodes}
          selectedNode={selectedNode}
          onSelectNode={setSelectedNode}
        />

        {/* Center: Map / Comms + Detail */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* View Toggle */}
          <div className="flex items-center gap-1 px-3 py-1.5 border-b border-border">
            {(["MAP", "COMMS"] as CenterView[]).map((view) => (
              <button
                key={view}
                onClick={() => setCenterView(view)}
                className={`font-label px-3 py-1 border transition-colors duration-50 ${
                  centerView === view
                    ? "border-primary text-primary"
                    : "border-border text-muted-foreground hover:text-foreground hover:border-foreground"
                }`}
              >
                {view}
              </button>
            ))}
            {centerView === "MAP" && (
              <span className="ml-auto font-label text-muted-foreground">
                {mesh.nodes.filter((n) => n.position && n.position.latitude !== 0).length} GPS_FIX
              </span>
            )}
            {centerView === "COMMS" && (
              <span className="ml-auto font-label text-muted-foreground">
                {mesh.messages.length} MSG
              </span>
            )}
          </div>

          <div className="flex-1 overflow-hidden">
            {centerView === "MAP" ? (
              <NodeMap
                nodes={mesh.nodes}
                selectedNode={selectedNode}
                onSelectNode={setSelectedNode}
              />
            ) : (
              <CommsStream
                messages={mesh.messages}
                nodes={mesh.nodes}
                myNodeNum={mesh.myNodeNum}
                onSendMessage={mesh.sendMessage}
              />
            )}
          </div>

          {selectedNode && <NodeDetailPanel node={selectedNode} />}
        </div>
      </div>

      <ConnectionOverlay
        status={mesh.status}
        error={mesh.error}
        config={mesh.config}
        onRetry={mesh.connect}
        onUpdateConfig={mesh.setConfig}
      />
    </div>
  );
};

export default Index;
