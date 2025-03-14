import { Repository } from "typeorm";
import { AppDataSource } from "../../config/database";
import { User } from "../../entities/user.entity";

export class UserRepository {
  private repository: Repository<User>;

  constructor() {
    this.repository = AppDataSource.getRepository(User);
  }

  async findAll(): Promise<User[]> {
    return this.repository.find();
  }

  async findById(id: number): Promise<User | null> {
    return this.repository.findOneBy({ id });
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.repository.create(userData);
    return this.repository.save(user);
  }

  async update(id: number, userData: Partial<User>): Promise<User | null> {
    await this.repository.update(id, userData);
    return this.repository.findOneBy({ id });
  }

  async delete(id: number): Promise<void> {
    const user = await this.findById(id);
    if (user) {
      await this.repository.remove(user);
    }
  }
}