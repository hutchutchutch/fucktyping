import { Express } from "express";
import userRoutes from "../modules/users/user.route";

export function registerRoutes(app: Express) {
  app.use("/user", userRoutes);
  // Add more routes for other modules here
}