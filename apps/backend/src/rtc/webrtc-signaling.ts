import { Server as SocketIOServer, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';

// Map room names to sets of socket IDs
const rooms = new Map<string, Set<string>>();

// Map socket ID to user ID
const socketUsers = new Map<string, string>();

// Map user ID to socket ID
const userSockets = new Map<string, string>();

/**
 * Initialize WebRTC signaling server
 */
export function initializeSignalingServer(io: SocketIOServer) {
  console.log('Initializing WebRTC signaling server');

  io.on('connection', (socket: Socket) => {
    console.log(`New WebRTC signaling connection: ${socket.id}`);
    
    // Handle user registration
    socket.on('register', (data: { userId: string }) => {
      if (!data.userId) return;
      
      // Store user mapping
      socketUsers.set(socket.id, data.userId);
      userSockets.set(data.userId, socket.id);
      
      console.log(`User registered: ${data.userId} (socket: ${socket.id})`);
    });
    
    // Handle room joining
    socket.on('join_room', (data: { roomId: string, userId: string }) => {
      if (!data.roomId) return;
      
      const { roomId, userId } = data;
      
      // Register user if not already registered
      if (userId && socketUsers.get(socket.id) !== userId) {
        socketUsers.set(socket.id, userId);
        userSockets.set(userId, socket.id);
      }
      
      // Create room if it doesn't exist
      if (!rooms.has(roomId)) {
        rooms.set(roomId, new Set());
      }
      
      // Get current user ID
      const currentUserId = socketUsers.get(socket.id);
      if (!currentUserId) return;
      
      // Add socket to room
      const room = rooms.get(roomId)!;
      
      // Join the Socket.IO room
      socket.join(roomId);
      
      // Add to our room tracking
      room.add(socket.id);
      
      console.log(`User ${currentUserId} joined room ${roomId} (total users: ${room.size})`);
      
      // Determine if this user is the initiator (first in room)
      const isInitiator = room.size === 1;
      
      // Get list of peers already in the room (excluding self)
      const peers: string[] = [];
      room.forEach(peerId => {
        if (peerId !== socket.id) {
          const peerUserId = socketUsers.get(peerId);
          if (peerUserId) {
            peers.push(peerUserId);
          }
        }
      });
      
      // Notify user that they joined the room
      socket.emit('room_joined', {
        roomId,
        isInitiator,
        peers
      });
      
      // Notify others in the room
      socket.to(roomId).emit('user_joined', {
        roomId,
        userId: currentUserId
      });
    });
    
    // Handle room leaving
    socket.on('leave_room', (data: { roomId: string }) => {
      if (!data.roomId) return;
      
      const { roomId } = data;
      const userId = socketUsers.get(socket.id);
      
      leaveRoom(socket, roomId);
    });
    
    // Handle WebRTC signaling messages
    socket.on('rtc_offer', (data: { from: string, to: string, roomId: string, sdp: any }) => {
      if (!data.to || !data.roomId || !data.sdp) return;
      
      const targetSocketId = userSockets.get(data.to);
      if (targetSocketId) {
        io.to(targetSocketId).emit('rtc_offer', data);
        console.log(`Relayed offer from ${data.from} to ${data.to}`);
      }
    });
    
    socket.on('rtc_answer', (data: { from: string, to: string, roomId: string, sdp: any }) => {
      if (!data.to || !data.roomId || !data.sdp) return;
      
      const targetSocketId = userSockets.get(data.to);
      if (targetSocketId) {
        io.to(targetSocketId).emit('rtc_answer', data);
        console.log(`Relayed answer from ${data.from} to ${data.to}`);
      }
    });
    
    socket.on('rtc_ice_candidate', (data: { from: string, to: string, roomId: string, candidate: any }) => {
      if (!data.to || !data.roomId || !data.candidate) return;
      
      const targetSocketId = userSockets.get(data.to);
      if (targetSocketId) {
        io.to(targetSocketId).emit('rtc_ice_candidate', data);
        console.log(`Relayed ICE candidate from ${data.from} to ${data.to}`);
      }
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
      handleDisconnection(socket);
    });
  });
}

/**
 * Handle user leaving a room
 */
function leaveRoom(socket: Socket, roomId: string) {
  const userId = socketUsers.get(socket.id);
  if (!userId) return;
  
  const room = rooms.get(roomId);
  if (!room) return;
  
  // Remove socket from room
  room.delete(socket.id);
  
  // Leave the Socket.IO room
  socket.leave(roomId);
  
  console.log(`User ${userId} left room ${roomId}`);
  
  // Notify others in the room
  socket.to(roomId).emit('user_left', {
    roomId,
    userId
  });
  
  // Clean up room if empty
  if (room.size === 0) {
    rooms.delete(roomId);
    console.log(`Room ${roomId} deleted (empty)`);
  }
}

/**
 * Handle client disconnection
 */
function handleDisconnection(socket: Socket) {
  const userId = socketUsers.get(socket.id);
  
  if (userId) {
    console.log(`User ${userId} disconnected (socket: ${socket.id})`);
    
    // Remove user mapping
    socketUsers.delete(socket.id);
    userSockets.delete(userId);
    
    // Remove from all rooms
    rooms.forEach((socketIds, roomId) => {
      if (socketIds.has(socket.id)) {
        leaveRoom(socket, roomId);
      }
    });
  } else {
    console.log(`Socket disconnected: ${socket.id}`);
  }
}