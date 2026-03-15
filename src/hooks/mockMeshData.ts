import type { MeshNode, MeshMessage } from "./useMeshtastic";

const now = Math.floor(Date.now() / 1000);

export const MOCK_NODES: MeshNode[] = [
  {
    num: 0x8c32f1a4,
    user: { id: "!8c32f1a4", longName: "Base Station Alpha", shortName: "BSA", hwModel: "TBEAM" },
    position: { latitude: 37.7749, longitude: -122.4194, altitude: 52, time: now - 30 },
    snr: 9.25,
    lastHeard: now - 15,
    deviceMetrics: { batteryLevel: 87, voltage: 4.12, channelUtilization: 3.2, airUtilTx: 1.1, uptimeSeconds: 86420 },
    hopsAway: 0,
    channel: 0,
  },
  {
    num: 0x7a2b9c01,
    user: { id: "!7a2b9c01", longName: "Relay Node Bravo", shortName: "RNB", hwModel: "HELTEC_V3" },
    position: { latitude: 37.7851, longitude: -122.4094, altitude: 120, time: now - 120 },
    snr: 4.50,
    lastHeard: now - 90,
    deviceMetrics: { batteryLevel: 43, voltage: 3.72, channelUtilization: 8.1, airUtilTx: 2.4, uptimeSeconds: 172800 },
    hopsAway: 1,
    channel: 0,
  },
  {
    num: 0x55c77c48,
    user: { id: "!55c77c48", longName: "Mobile Unit Charlie", shortName: "MUC", hwModel: "TBEAM_S3" },
    position: { latitude: 37.7650, longitude: -122.4300, altitude: 15, time: now - 600 },
    snr: -2.75,
    lastHeard: now - 480,
    deviceMetrics: { batteryLevel: 12, voltage: 3.31, channelUtilization: 1.5, airUtilTx: 0.3, uptimeSeconds: 3600 },
    hopsAway: 2,
    channel: 0,
  },
  {
    num: 0xde4f8b12,
    user: { id: "!de4f8b12", longName: "Hilltop Delta", shortName: "HTD", hwModel: "RAK4631" },
    position: { latitude: 37.7920, longitude: -122.3980, altitude: 285, time: now - 45 },
    snr: 7.00,
    lastHeard: now - 45,
    deviceMetrics: { batteryLevel: 95, voltage: 4.18, channelUtilization: 5.7, airUtilTx: 3.2, uptimeSeconds: 604800 },
    hopsAway: 1,
    viaMqtt: true,
    channel: 0,
  },
  {
    num: 0xa1b2c3d4,
    user: { id: "!a1b2c3d4", longName: "Sensor Echo", shortName: "SNE", hwModel: "NANO_G1" },
    snr: 1.25,
    lastHeard: now - 1200,
    deviceMetrics: { batteryLevel: 68, voltage: 3.89, channelUtilization: 0.4, airUtilTx: 0.1, uptimeSeconds: 259200 },
    hopsAway: 3,
    channel: 0,
  },
];

export const MOCK_MESSAGES: MeshMessage[] = [
  { id: "m1", from: 0x8c32f1a4, to: 0xffffffff, text: "Mesh check — all stations report in", time: now - 300 },
  { id: "m2", from: 0x7a2b9c01, to: 0xffffffff, text: "Bravo online, relay nominal", time: now - 280, rxSnr: 6.5, rxRssi: -78 },
  { id: "m3", from: 0xde4f8b12, to: 0xffffffff, text: "Delta ACK — hilltop link solid", time: now - 260, rxSnr: 8.0, rxRssi: -62 },
  { id: "m4", from: 0x55c77c48, to: 0xffffffff, text: "Charlie mobile — signal marginal, moving to higher ground", time: now - 240, rxSnr: -1.5, rxRssi: -105 },
  { id: "m5", from: 0xa1b2c3d4, to: 0x8c32f1a4, text: "Env report: 22.4C / 58% RH / 1013hPa", time: now - 180, rxSnr: 2.0, rxRssi: -95 },
  { id: "m6", from: 0x8c32f1a4, to: 0xffffffff, text: "Copy all. Network health: 5/5 nodes active", time: now - 120 },
  { id: "m7", from: 0x7a2b9c01, to: 0xffffffff, text: "Traffic spike on CH0 — util at 8.1%", time: now - 60, rxSnr: 4.2, rxRssi: -82 },
];
