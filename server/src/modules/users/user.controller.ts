import { Request, Response } from "express";
import { UserService } from "./user.service";
import { UserData } from "./user.interface";

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  async getAllUsers(_req: Request, res: Response) {
    try {
      const users = await this.userService.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Error fetching users", error });
    }
  }

  async getUserById(req: Request, res: Response) {
    try {
      const user = await this.userService.getUserById(parseInt(req.params.id));
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Error fetching user", error });
    }
  }

  async createUser(req: Request, res: Response) {
    console.log('rererer')
    try {
      const userData: UserData = req.body;
      if (!userData.username || !userData.email || !userData.password) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      const user = await this.userService.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      res.status(500).json({ message: "Error creating user", error });
    }
  }

  async updateUser(req: Request, res: Response) {
    try {
      const userData: Partial<UserData> = req.body;
      const user = await this.userService.updateUser(parseInt(req.params.id), userData);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Error updating user", error });
    }
  }

  async deleteUser(req: Request, res: Response) {
    try {
      const user = await this.userService.getUserById(parseInt(req.params.id));
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      await this.userService.deleteUser(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error deleting user", error });
    }
  }
}