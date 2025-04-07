import { WebSocket } from "ws";
import { v4 as uuidv4 } from "uuid";

// Store active WebSocket connections
const activeConnections = new Map<string, WebSocketSession>();

interface WebSocketSession {
  id: string;
  ws: WebSocket;
  formId?: string;
  responseId?: string;
  lastActivity: Date;
}

/**
 * Create a new WebSocket session
 */
export function createSession(ws: WebSocket): WebSocketSession {
  const sessionId = uuidv4();
  const session: WebSocketSession = {
    id: sessionId,
    ws,
    lastActivity: new Date(),
  };
  
  activeConnections.set(sessionId, session);
  
  // Set up event handlers
  ws.on("close", () => {
    removeSession(sessionId);
  });
  
  return session;
}

/**
 * Get a WebSocket session by ID
 */
export function getSession(sessionId: string): WebSocketSession | undefined {
  return activeConnections.get(sessionId);
}

/**
 * Update session with form and response IDs
 */
export function updateSession(
  sessionId: string,
  formId: string,
  responseId?: string
): WebSocketSession | undefined {
  const session = activeConnections.get(sessionId);
  if (!session) return undefined;
  
  session.formId = formId;
  if (responseId) session.responseId = responseId;
  session.lastActivity = new Date();
  
  return session;
}

/**
 * Remove WebSocket session 
 */
export function removeSession(sessionId: string): boolean {
  return activeConnections.delete(sessionId);
}

/**
 * Send message to WebSocket client
 */
export function sendMessage(sessionId: string, message: any): boolean {
  const session = activeConnections.get(sessionId);
  if (!session) return false;
  
  try {
    session.ws.send(JSON.stringify(message));
    session.lastActivity = new Date();
    return true;
  } catch (error) {
    console.error(`Error sending message to session ${sessionId}:`, error);
    return false;
  }
}

/**
 * Broadcast message to all WebSocket clients matching a filter
 */
export function broadcastMessage(
  message: any,
  filter?: (session: WebSocketSession) => boolean
): number {
  let sentCount = 0;
  
  activeConnections.forEach((session) => {
    if (!filter || filter(session)) {
      try {
        session.ws.send(JSON.stringify(message));
        session.lastActivity = new Date();
        sentCount++;
      } catch (error) {
        console.error(`Error broadcasting to session ${session.id}:`, error);
      }
    }
  });
  
  return sentCount;
}

/**
 * Get all active WebSocket sessions
 */
export function getAllSessions(): WebSocketSession[] {
  return Array.from(activeConnections.values());
}

/**
 * Get the number of active WebSocket connections
 */
export function getActiveConnectionCount(): number {
  return activeConnections.size;
}

/**
 * Clean up inactive WebSocket sessions
 */
export function cleanupInactiveSessions(maxInactivityMinutes = 30): number {
  const now = new Date();
  let cleanedCount = 0;
  
  activeConnections.forEach((session, sessionId) => {
    const inactiveMs = now.getTime() - session.lastActivity.getTime();
    const inactiveMinutes = inactiveMs / (1000 * 60);
    
    if (inactiveMinutes > maxInactivityMinutes) {
      try {
        session.ws.close();
      } catch (e) {
        // Ignore close errors
      }
      
      activeConnections.delete(sessionId);
      cleanedCount++;
    }
  });
  
  return cleanedCount;
}