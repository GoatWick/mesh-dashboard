import { useState } from "react";
import { useMeshtastic, type MeshNode } from "@/hooks/useMeshtastic";
import { StatusHeader } from "@/components/StatusHeader";
import { NodeSidebar } from "@/components/NodeSidebar";
import { CommsStream } from "@/components/CommsStream";
import { NodeDetailPanel } from "@/components/NodeDetailPanel";
import { ConnectionOverlay } from "@/components/ConnectionOverlay";

const Index = () => {
  const mesh = useMeshtastic();
  const [selectedNode, setSelectedNode] = useState<MeshNode | null>(null);

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      <StatusHeader
        status={mesh.status}
        nodeCount={mesh.nodes.length}
        lastUpdate={mesh.lastUpdate}
        myNodeNum={mesh.myNodeNum}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Left: Node List */}
        <NodeSidebar
          nodes={mesh.nodes}
          selectedNode={selectedNode}
          onSelectNode={setSelectedNode}
        />

        {/* Center: Comms + Detail */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-hidden">
            <CommsStream
              messages={mesh.messages}
              nodes={mesh.nodes}
              myNodeNum={mesh.myNodeNum}
              onSendMessage={mesh.sendMessage}
            />
          </div>

          {selectedNode && <NodeDetailPanel node={selectedNode} />}
        </div>
      </div>

      <ConnectionOverlay
        status={mesh.status}
        error={mesh.error}
        onRetry={mesh.connect}
      />
    </div>
  );
};

export default Index;
