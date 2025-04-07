import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { initializeStorage } from "./storage";
import { initializeSignalingServer } from "./rtc/webrtc-signaling";
import dotenv from "dotenv";
import cors from "cors";
import { Server as SocketIOServer } from "socket.io";
import http from "http";

// Load environment variables
dotenv.config();

// Create Express application
const app = express();

// Create HTTP server and Socket.IO server for signaling
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Initialize WebRTC signaling
initializeSignalingServer(io);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      console.log(logLine);
    }
  });

  next();
});

// Start server
(async () => {
  try {
    // Initialize the database before starting the server
    await initializeStorage();
    console.log("Database initialized successfully");

    // Register API routes
    await registerRoutes(app, wss);

    // Error handling middleware
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      res.status(status).json({ message });
      console.error(err);
    });

    // Get port from environment or use default
    const port = process.env.PORT || 3000;
    
    // Start the server
    server.listen(
      {
        port,
        host: "0.0.0.0",
      },
      () => {
        console.log(`Server running on port ${port}`);
        console.log(`WebRTC signaling server active`);
      },
    );
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
})();