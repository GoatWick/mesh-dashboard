import { useState, useEffect, useCallback, useRef } from "react";

const DEVICE_IP = "192.168.1.89";
const POLL_INTERVAL = 5000;

export interface MeshNode {
  num: number;
  user?: {
    id: string;
    longName: string;
    shortName: string;
    hwModel: string;
    macaddr?: string;
  };
  position?: {
    latitude: number;
    longitude: number;
    altitude: number;
    time: number;
  };
  snr: number;
  lastHeard: number;
  deviceMetrics?: {
    batteryLevel: number;
    voltage: number;
    channelUtilization: number;
    airUtilTx: number;
    uptimeSeconds: number;
  };
  hopsAway?: number;
  viaMqtt?: boolean;
  channel?: number;
}

export interface MeshMessage {
  id: string;
  from: number;
  to: number;
  text: string;
  time: number;
  channel?: number;
  rxSnr?: number;
  rxRssi?: number;
}

export type ConnectionStatus = "DISCONNECTED" | "CONNECTING" | "LINK_ACQUIRED" | "LINK_LOST";

export interface MeshState {
  status: ConnectionStatus;
  myNodeNum: number | null;
  nodes: MeshNode[];
  messages: MeshMessage[];
  lastUpdate: number | null;
  error: string | null;
}

function buildUrl(path: string): string {
  return `http://${DEVICE_IP}${path}`;
}

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(buildUrl(path), {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  return res.json();
}

export function useMeshtastic() {
  const [state, setState] = useState<MeshState>({
    status: "DISCONNECTED",
    myNodeNum: null,
    nodes: [],
    messages: [],
    lastUpdate: null,
    error: null,
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchNodes = useCallback(async () => {
    try {
      // Meshtastic HTTP API v1 JSON endpoints
      const data = await fetchJson<Record<string, MeshNode>>("/api/v1/nodes");
      const nodes = Object.values(data);
      return nodes;
    } catch {
      return null;
    }
  }, []);

  const pollDevice = useCallback(async () => {
    try {
      setState((s) => ({
        ...s,
        status: s.status === "DISCONNECTED" ? "CONNECTING" : s.status,
      }));

      // Fetch nodes
      const nodes = await fetchNodes();

      if (nodes) {
        setState((s) => ({
          ...s,
          status: "LINK_ACQUIRED",
          nodes,
          lastUpdate: Date.now(),
          error: null,
          myNodeNum: s.myNodeNum ?? (nodes.length > 0 ? nodes[0]?.num : null),
        }));
      } else {
        throw new Error("CONNECTION_REFUSED");
      }
    } catch (err) {
      setState((s) => ({
        ...s,
        status: "LINK_LOST",
        error: err instanceof Error ? err.message : "UNKNOWN_ERROR",
      }));
    }
  }, [fetchNodes]);

  const sendMessage = useCallback(async (text: string, to?: number) => {
    try {
      await fetch(buildUrl("/api/v1/sendtext"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          to: to ?? 0xffffffff, // broadcast
        }),
      });

      // Add to local messages
      setState((s) => ({
        ...s,
        messages: [
          ...s.messages,
          {
            id: `local-${Date.now()}`,
            from: s.myNodeNum ?? 0,
            to: to ?? 0xffffffff,
            text,
            time: Math.floor(Date.now() / 1000),
          },
        ],
      }));
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  }, []);

  const connect = useCallback(() => {
    pollDevice();
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(pollDevice, POLL_INTERVAL);
  }, [pollDevice]);

  const disconnect = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setState({
      status: "DISCONNECTED",
      myNodeNum: null,
      nodes: [],
      messages: [],
      lastUpdate: null,
      error: null,
    });
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [connect]);

  return { ...state, sendMessage, connect, disconnect };
}
