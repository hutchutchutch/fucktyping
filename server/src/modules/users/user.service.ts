import { UserData } from "./user.interface";
import { User } from "../../entities/user.entity";
import { UserRepository } from "./user.repository";

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
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