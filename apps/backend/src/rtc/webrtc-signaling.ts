import { WebSocket, WebSocketServer } from 'ws';
import { v4 as uuidv4 } from 'uuid';

// Store active WebRTC signaling connections
const activeConnections = new Map<string, WebRTCSession>();

// Map user IDs to session IDs
const userSessions = new Map<string, string>();

// Map room names to sets of session IDs
const rooms = new Map<string, Set<string>>();

interface WebRTCSession {
  id: string;
  ws: WebSocket;
  userId?: string;
  roomId?: string;
  lastActivity: Date;
}

interface SignalingMessage {
  type: string;
  roomId?: string;
  userId?: string;
  targetId?: string;
  sdp?: any;
  candidate?: any;
  data?: any;
}

/**
 * Initialize WebRTC signaling server
 */
export function initializeSignalingServer(wss: WebSocketServer) {
  console.log('Initializing WebRTC signaling server');

  wss.on('connection', (ws) => {
    const sessionId = uuidv4();
    const session: WebRTCSession = {
      id: sessionId,
      ws,
      lastActivity: new Date(),
    };
    
    activeConnections.set(sessionId, session);
    console.log(`New WebRTC signaling connection established: ${sessionId}`);
    
    // Send session ID to client
    ws.send(JSON.stringify({
      type: 'session_created',
      sessionId,
    }));
    
    // Handle messages
    ws.on('message', (message) => {
      try {
        const data: SignalingMessage = JSON.parse(message.toString());
        handleSignalingMessage(sessionId, data);
      } catch (error) {
        console.error('Error handling WebRTC signaling message:', error);
      }
    });
    
    // Handle disconnection
    ws.on('close', () => {
      handleDisconnection(sessionId);
    });
  });
  
  // Setup periodic cleanup
  setInterval(cleanupInactiveSessions, 5 * 60 * 1000); // Every 5 minutes
}

/**
 * Handle WebRTC signaling messages
 */
function handleSignalingMessage(sessionId: string, message: SignalingMessage) {
  const session = activeConnections.get(sessionId);
  if (!session) return;
  
  // Update last activity
  session.lastActivity = new Date();
  
  switch (message.type) {
    case 'register':
      if (message.userId) {
        registerUser(sessionId, message.userId);
      }
      break;
      
    case 'join_room':
      if (message.roomId && message.userId) {
        joinRoom(sessionId, message.roomId, message.userId);
      }
      break;
      
    case 'leave_room':
      if (message.roomId) {
        leaveRoom(sessionId, message.roomId);
      }
      break;
      
    case 'offer':
    case 'answer':
    case 'ice_candidate':
      relaySignalingMessage(sessionId, message);
      break;
      
    default:
      console.warn(`Unknown signaling message type: ${message.type}`);
  }
}

/**
 * Register a user with a session
 */
function registerUser(sessionId: string, userId: string) {
  const session = activeConnections.get(sessionId);
  if (!session) return;
  
  // Remove old mapping if it exists
  if (session.userId) {
    userSessions.delete(session.userId);
  }
  
  // Set new mapping
  session.userId = userId;
  userSessions.set(userId, sessionId);
  
  console.log(`User registered: ${userId} (session: ${sessionId})`);
}

/**
 * Join a WebRTC room
 */
function joinRoom(sessionId: string, roomId: string, userId: string) {
  const session = activeConnections.get(sessionId);
  if (!session) return;
  
  // Register user if not already registered
  if (session.userId !== userId) {
    registerUser(sessionId, userId);
  }
  
  // Leave current room if in one
  if (session.roomId && session.roomId !== roomId) {
    leaveRoom(sessionId, session.roomId);
  }
  
  // Join new room
  session.roomId = roomId;
  
  // Create room if it doesn't exist
  if (!rooms.has(roomId)) {
    rooms.set(roomId, new Set());
  }
  
  // Add session to room
  const room = rooms.get(roomId)!;
  room.add(sessionId);
  
  console.log(`User ${userId} joined room ${roomId} (total users: ${room.size})`);
  
  // Notify others in the room
  room.forEach((memberId) => {
    if (memberId !== sessionId) {
      const memberSession = activeConnections.get(memberId);
      if (memberSession && memberSession.userId) {
        // Notify the existing member about the new user
        memberSession.ws.send(JSON.stringify({
          type: 'user_joined',
          roomId,
          userId,
        }));
        
        // Notify the new user about the existing member
        session.ws.send(JSON.stringify({
          type: 'user_joined',
          roomId,
          userId: memberSession.userId,
        }));
      }
    }
  });
}

/**
 * Leave a WebRTC room
 */
function leaveRoom(sessionId: string, roomId: string) {
  const session = activeConnections.get(sessionId);
  if (!session) return;
  
  const room = rooms.get(roomId);
  if (!room) return;
  
  // Remove session from room
  room.delete(sessionId);
  
  // Notify others in the room
  if (session.userId) {
    room.forEach((memberId) => {
      const memberSession = activeConnections.get(memberId);
      if (memberSession) {
        memberSession.ws.send(JSON.stringify({
          type: 'user_left',
          roomId,
          userId: session.userId,
        }));
      }
    });
  }
  
  // Clean up room if empty
  if (room.size === 0) {
    rooms.delete(roomId);
    console.log(`Room ${roomId} deleted (empty)`);
  }
  
  // Clear room from session
  session.roomId = undefined;
  
  console.log(`User ${session.userId} left room ${roomId}`);
}

/**
 * Relay WebRTC signaling messages
 */
function relaySignalingMessage(sessionId: string, message: SignalingMessage) {
  const session = activeConnections.get(sessionId);
  if (!session || !session.userId) return;
  
  // If targetId is provided, send only to that user
  if (message.targetId) {
    const targetSessionId = userSessions.get(message.targetId);
    if (targetSessionId) {
      const targetSession = activeConnections.get(targetSessionId);
      if (targetSession) {
        // Add the sender's ID to the message
        const relayMessage = {
          ...message,
          userId: session.userId,
        };
        
        targetSession.ws.send(JSON.stringify(relayMessage));
        console.log(`Relayed ${message.type} from ${session.userId} to ${message.targetId}`);
      }
    }
    return;
  }
  
  // If no targetId and in a room, broadcast to all users in the room
  if (session.roomId) {
    const room = rooms.get(session.roomId);
    if (room) {
      room.forEach((memberId) => {
        if (memberId !== sessionId) {
          const memberSession = activeConnections.get(memberId);
          if (memberSession) {
            // Add the sender's ID to the message
            const relayMessage = {
              ...message,
              userId: session.userId,
              roomId: session.roomId,
            };
            
            memberSession.ws.send(JSON.stringify(relayMessage));
          }
        }
      });
    }
  }
}

/**
 * Handle client disconnection
 */
function handleDisconnection(sessionId: string) {
  const session = activeConnections.get(sessionId);
  if (!session) return;
  
  // Leave any rooms
  if (session.roomId) {
    leaveRoom(sessionId, session.roomId);
  }
  
  // Remove user mapping
  if (session.userId) {
    userSessions.delete(session.userId);
  }
  
  // Remove session
  activeConnections.delete(sessionId);
  
  console.log(`WebRTC signaling connection closed: ${sessionId}`);
}

/**
 * Clean up inactive sessions
 */
function cleanupInactiveSessions() {
  const now = new Date();
  let cleanedCount = 0;
  
  activeConnections.forEach((session, sessionId) => {
    const inactiveMs = now.getTime() - session.lastActivity.getTime();
    const inactiveMinutes = inactiveMs / (1000 * 60);
    
    // Clean up sessions inactive for more than 30 minutes
    if (inactiveMinutes > 30) {
      handleDisconnection(sessionId);
      cleanedCount++;
    }
  });
  
  if (cleanedCount > 0) {
    console.log(`Cleaned up ${cleanedCount} inactive WebRTC signaling sessions`);
  }
}