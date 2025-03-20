import express, { Express } from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import { UserService } from '../users/user.service';

const app: Express = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' },
});

app.use(express.json());
app.get('/', (req, res) => res.send('Socket.IO server is running!'));

const userService = new UserService(io);

io.on('connection', (socket: Socket) => {
  console.log('A user connected:', socket.id);

  socket.on('message', (msg: string) => {
    userService.sendMessage(socket.id, msg);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});