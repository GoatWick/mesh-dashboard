import { useState, useEffect, useCallback, useRef } from "react";

const POLL_INTERVAL = 5000;
const STORAGE_KEY = "mesh_ctrl_connection";

export interface ConnectionConfig {
  ip: string;
  protocol: "http" | "https";
}

function loadConfig(): ConnectionConfig {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return { ip: "192.168.1.89", protocol: "http" };
}

function saveConfig(config: ConnectionConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

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
  config: ConnectionConfig;
}

export function useMeshtastic() {
  const [config, setConfigState] = useState<ConnectionConfig>(loadConfig);
  const configRef = useRef(config);
  configRef.current = config;

  const [state, setState] = useState<Omit<MeshState, "config">>({
    status: "DISCONNECTED",
    myNodeNum: null,
    nodes: [],
    messages: [],
    lastUpdate: null,
    error: null,
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function buildUrl(path: string): string {
    const c = configRef.current;
    return `${c.protocol}://${c.ip}${path}`;
  }

  const fetchNodes = useCallback(async () => {
    try {
      const res = await fetch(buildUrl("/api/v1/nodes"), {
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: Record<string, MeshNode> = await res.json();
      return Object.values(data);
    } catch {
      return null;
    }
  }, []);

  const pollDevice = useCallback(async () => {
    setState((s) => ({
      ...s,
      status: s.status === "DISCONNECTED" ? "CONNECTING" : s.status,
    }));

    try {
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

  const setConfig = useCallback((newConfig: ConnectionConfig) => {
    saveConfig(newConfig);
    setConfigState(newConfig);
    setTimeout(() => {
      disconnect();
      connect();
    }, 50);
  }, [disconnect, connect]);

  const sendMessage = useCallback(async (text: string, to?: number) => {
    try {
      await fetch(buildUrl("/api/v1/sendtext"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, to: to ?? 0xffffffff }),
      });
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

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return { ...state, config, setConfig, sendMessage, connect, disconnect };
}
