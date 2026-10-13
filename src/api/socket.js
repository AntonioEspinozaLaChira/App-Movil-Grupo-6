// Cliente de tiempo real. En modo mock simula un servidor de sockets con un
// emisor de eventos; con un backend real se reemplaza por WebSocket (wss://).
import { CONFIG } from './config';

const listeners = new Map(); // projectId -> Set<fn>
let sockets = new Map();

export function subscribeToProject(projectId, onMessage, token) {
  if (!listeners.has(projectId)) listeners.set(projectId, new Set());
  listeners.get(projectId).add(onMessage);

  if (!CONFIG.USE_MOCK) {
    const ws = new WebSocket(`${CONFIG.WS_URL}/projects/${projectId}/chat?token=${token}`);
    ws.onmessage = (e) => {
      try { onMessage(JSON.parse(e.data)); } catch {}
    };
    sockets.set(onMessage, ws);
  }
  return () => {
    listeners.get(projectId)?.delete(onMessage);
    sockets.get(onMessage)?.close();
    sockets.delete(onMessage);
  };
}

// Solo mock: emite el mensaje a todos los suscriptores de la sala.
export function emitMock(projectId, message) {
  listeners.get(projectId)?.forEach((fn) => fn(message));
}

export function sendThroughSocket(projectId, payload) {
  for (const ws of sockets.values()) {
    if (ws.readyState === 1) ws.send(JSON.stringify({ projectId, ...payload }));
  }
}
