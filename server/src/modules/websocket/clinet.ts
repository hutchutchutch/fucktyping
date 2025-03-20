import { io, Socket } from 'socket.io-client';

const socket: Socket = io('http://localhost:4000');

socket.on('connect', () => {
  console.log('Connected to server:', socket.id);
  socket.emit('message', 'Hello, world!');
});

socket.on('message', (msg: string) => {
  console.log('Message from server:', msg);
});

socket.on('disconnect', () => {
  console.log('Disconnected from server');
});