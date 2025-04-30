/**
 * Simple WebRTC signaling server for testing
 * 
 * This is a standalone version that doesn't depend on the rest of the backend
 */
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

// Create Express application
const app = express();
app.use(cors());
app.use(express.json());

// Create HTTP server and Socket.IO server for signaling
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Map room names to sets of socket IDs
const rooms = new Map();
// Map socket ID to user ID
const socketUsers = new Map();
// Map user ID to socket ID
const userSockets = new Map();

// Initialize WebRTC signaling
io.on('connection', (socket) => {
  console.log(`New WebRTC signaling connection: ${socket.id}`);
  
  // Handle user registration
  socket.on('register', (data) => {
    if (!data.userId) return;
    
    // Store user mapping
    socketUsers.set(socket.id, data.userId);
    userSockets.set(data.userId, socket.id);
    
    console.log(`User registered: ${data.userId} (socket: ${socket.id})`);
  });
  
  // Handle room joining
  socket.on('join_room', (data) => {
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
    const room = rooms.get(roomId);
    
    // Join the Socket.IO room
    socket.join(roomId);
    
    // Add to our room tracking
    room.add(socket.id);
    
    console.log(`User ${currentUserId} joined room ${roomId} (total users: ${room.size})`);
    
    // Determine if this user is the initiator (first in room)
    const isInitiator = room.size === 1;
    
    // Get list of peers already in the room (excluding self)
    const peers = [];
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
  socket.on('leave_room', (data) => {
    if (!data.roomId) return;
    
    const { roomId } = data;
    leaveRoom(socket, roomId);
  });
  
  // Handle WebRTC signaling messages
  socket.on('rtc_offer', (data) => {
    if (!data.to || !data.roomId || !data.sdp) return;
    
    const targetSocketId = userSockets.get(data.to);
    if (targetSocketId) {
      io.to(targetSocketId).emit('rtc_offer', data);
      console.log(`Relayed offer from ${data.from} to ${data.to}`);
    }
  });
  
  socket.on('rtc_answer', (data) => {
    if (!data.to || !data.roomId || !data.sdp) return;
    
    const targetSocketId = userSockets.get(data.to);
    if (targetSocketId) {
      io.to(targetSocketId).emit('rtc_answer', data);
      console.log(`Relayed answer from ${data.from} to ${data.to}`);
    }
  });
  
  socket.on('rtc_ice_candidate', (data) => {
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

/**
 * Handle user leaving a room
 */
function leaveRoom(socket, roomId) {
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
function handleDisconnection(socket) {
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

// API endpoint for creating rooms
app.post('/api/rtc/create-room', (req, res) => {
  const { roomId } = req.body;
  if (!roomId) {
    return res.status(400).json({ error: 'Room ID is required' });
  }
  
  res.json({ 
    success: true, 
    roomId, 
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`WebRTC signaling server running on port ${PORT}`);
});