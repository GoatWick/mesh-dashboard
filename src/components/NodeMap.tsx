import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { MeshNode } from "@/hooks/useMeshtastic";

interface NodeMapProps {
  nodes: MeshNode[];
  selectedNode: MeshNode | null;
  onSelectNode: (node: MeshNode) => void;
}

function createNodeIcon(node: MeshNode, isSelected: boolean): L.DivIcon {
  const minutes = node.lastHeard ? (Date.now() / 1000 - node.lastHeard) / 60 : 999;
  const color = minutes < 5 ? "#22c55e" : minutes < 15 ? "#f59e0b" : "#ef4444";
  const size = isSelected ? 14 : 10;
  const glow = isSelected ? `box-shadow: 0 0 12px ${color};` : "";

  return L.divIcon({
    className: "",
    html: `<div style="
      width:${size}px;height:${size}px;
      background:${color};
      border:1px solid rgba(255,255,255,0.3);
      border-radius:1px;
      ${glow}
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function formatLastSeen(timestamp: number): string {
  if (!timestamp) return "NEVER";
  const seconds = Math.floor(Date.now() / 1000 - timestamp);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  return `${Math.floor(seconds / 3600)}h ago`;
}

function FitBounds({ nodes }: { nodes: MeshNode[] }) {
  const map = useMap();
  const positioned = nodes.filter((n) => n.position);

  useEffect(() => {
    if (positioned.length === 0) return;
    const bounds = L.latLngBounds(
      positioned.map((n) => [n.position!.latitude, n.position!.longitude])
    );
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
  }, [positioned.length]); // only refit when node count changes

  return null;
}

function FlyToSelected({ node }: { node: MeshNode | null }) {
  const map = useMap();
  useEffect(() => {
    if (node?.position) {
      map.flyTo([node.position.latitude, node.position.longitude], 14, {
        duration: 0.5,
      });
    }
  }, [node?.num]);
  return null;
}

export function NodeMap({ nodes, selectedNode, onSelectNode }: NodeMapProps) {
  const positionedNodes = useMemo(
    () => nodes.filter((n) => n.position && n.position.latitude !== 0),
    [nodes]
  );

  if (positionedNodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <div className="text-center">
          <div className="font-data text-sm mb-2">NO_POSITION_DATA</div>
          <div className="font-label">Waiting for nodes with GPS fix...</div>
        </div>
      </div>
    );
  }

  const center: [number, number] = [
    positionedNodes[0].position!.latitude,
    positionedNodes[0].position!.longitude,
  ];

  return (
    <div className="h-full w-full relative">
      {/* Map overlay header */}
      <div className="absolute top-2 left-2 z-[1000] tactical-card px-2 py-1">
        <span className="font-label text-muted-foreground">
          MAP // {positionedNodes.length} NODES WITH GPS
        </span>
      </div>

      <MapContainer
        center={center}
        zoom={13}
        className="h-full w-full"
        zoomControl={false}
        attributionControl={false}
        style={{ background: "hsl(240, 10%, 3%)" }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        />
        <FitBounds nodes={positionedNodes} />
        <FlyToSelected node={selectedNode} />

        {positionedNodes.map((node) => (
          <Marker
            key={node.num}
            position={[node.position!.latitude, node.position!.longitude]}
            icon={createNodeIcon(node, selectedNode?.num === node.num)}
            eventHandlers={{
              click: () => onSelectNode(node),
            }}
          >
            <Popup className="mesh-popup">
              <div className="bg-background border border-border p-3 font-mono text-xs min-w-[200px]">
                <div className="flex justify-between border-b border-border pb-1 mb-2">
                  <span className="text-muted-foreground uppercase">NODE_ID</span>
                  <span className="text-primary">
                    {node.user?.id ?? `!${node.num.toString(16)}`}
                  </span>
                </div>
                {node.user && (
                  <div className="mb-2 text-foreground">
                    {node.user.longName}
                    <span className="text-muted-foreground ml-1">[{node.user.shortName}]</span>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div>
                    <div className="text-muted-foreground uppercase">[SNR]</div>
                    <div className={node.snr > 5 ? "text-signal-green" : node.snr > 0 ? "text-signal-amber" : "text-signal-red"}>
                      {node.snr.toFixed(1)}dB
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground uppercase">[SEEN]</div>
                    <div className="text-foreground">{formatLastSeen(node.lastHeard)}</div>
                  </div>
                  {node.deviceMetrics && (
                    <>
                      <div>
                        <div className="text-muted-foreground uppercase">[BATT]</div>
                        <div className={
                          node.deviceMetrics.batteryLevel > 50 ? "text-signal-green" :
                          node.deviceMetrics.batteryLevel > 20 ? "text-signal-amber" : "text-signal-red"
                        }>
                          {node.deviceMetrics.batteryLevel}%
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground uppercase">[VOLT]</div>
                        <div className="text-foreground">{node.deviceMetrics.voltage.toFixed(2)}V</div>
                      </div>
                    </>
                  )}
                  <div>
                    <div className="text-muted-foreground uppercase">[LAT]</div>
                    <div className="text-foreground">{node.position!.latitude.toFixed(5)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground uppercase">[LON]</div>
                    <div className="text-foreground">{node.position!.longitude.toFixed(5)}</div>
                  </div>
                  {node.position!.altitude > 0 && (
                    <div>
                      <div className="text-muted-foreground uppercase">[ALT]</div>
                      <div className="text-foreground">{node.position!.altitude}m</div>
                    </div>
                  )}
                  {node.hopsAway !== undefined && (
                    <div>
                      <div className="text-muted-foreground uppercase">[HOPS]</div>
                      <div className="text-foreground">{node.hopsAway}</div>
                    </div>
                  )}
                </div>
                {node.user?.hwModel && (
                  <div className="mt-2 pt-1 border-t border-border text-muted-foreground">
                    HW: {node.user.hwModel}
                    {node.viaMqtt && <span className="text-signal-amber ml-2">[MQTT]</span>}
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
