import { UserData } from "./user.interface";
import { User } from "../../entities/user.entity";
import { UserRepository } from "./user.repository";
import { Server, Socket } from 'socket.io';

export class UserService {
  private userRepository: UserRepository;
  private io: Server;
  constructor(io: Server) {
    this.io = io;
    this.userRepository = new UserRepository();
  }

  async sendMessage(userId: string, message: string) {
    // Save message to database (if needed)
    console.log(`User ${userId} sent message: ${message}`);

    // Broadcast message to all clients
    this.io.emit('message', `${userId}: ${message}`);
  }
  async getAllUsers(): Promise<User[]> {

     return this.userRepository.findAll();
  }

  async getUserById(id: number): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  async createUser(userData: UserData): Promise<User> {
    // In production, hash the password here using bcrypt
    return this.userRepository.create(userData);
  }

  async updateUser(id: number, userData: Partial<UserData>): Promise<User | null> {
    return this.userRepository.update(id, userData);
  }

  async deleteUser(id: number): Promise<void> {
    return this.userRepository.delete(id);
  }
}