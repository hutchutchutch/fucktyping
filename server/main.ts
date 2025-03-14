import "reflect-metadata";
import "dotenv"
import express, { Express } from "express";
import { registerRoutes } from "./src/apis/index";
import { logger } from "./utils/logger";
import { initializeDatabase } from "./src/config/database";


export async function createApp(): Promise<{ app: Express }> {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  console.log('rerelll')
  await initializeDatabase();
  logger("Database initialized successfully");

  registerRoutes(app); // Register all routes

  return { app };
}

(async () => {
  try {
    const { app } = await createApp();
    const port = process.env.PORT || 5000;

    app.listen(5000, "localhost", () => {
      logger(`Serving on port ${port}`);
    });
  } catch (error) {
    logger(`Failed to start server: ${error}`);
    process.exit(1);
  }
})();
