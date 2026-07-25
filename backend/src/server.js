import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";

import { connectDB } from "./config/db.js";
import { initSocket } from "./sockets/socket.service.js";
import orderRoutes from "./routes/order.routes.js";
import archiveRoutes from "./routes/archive.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import { errorHandler } from "./middlewares/errorHandler.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL;

const envOrigins = CLIENT_URL
  ? CLIENT_URL.split(",").map((url) => url.trim()).filter(Boolean)
  : [];

const defaultOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://order-management-system-42rfgu5jn-mahesh-wagh-s-projects.vercel.app",
];

const allowedOrigins = Array.from(new Set([...defaultOrigins, ...envOrigins]));

// Connect to MongoDB
connectDB();

// Initialize Socket.IO once
initSocket(server, allowedOrigins);

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const normalizedOrigin = origin.replace(/\/$/, "");
      const isAllowed =
        allowedOrigins.some((allowed) => allowed.replace(/\/$/, "") === normalizedOrigin) ||
        normalizedOrigin.endsWith(".vercel.app");

      if (isAllowed) {
        return callback(null, true);
      }
      return callback(new Error(`CORS policy error for origin: ${origin}`));
    },
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({ success: true, message: "Welcome to the backend API!" });
});
// Health Check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    service: "Store Order Management API",
  });
});

// API Routes
app.use("/api", orderRoutes);
app.use("/api", archiveRoutes);
app.use("/api", analyticsRoutes);

// Fallback 404 Route
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

// Start HTTP & WebSocket Server
server.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`🚀 Multi-Store Server running on port ${PORT}`);
  console.log(`📡 WebSocket server ready`);
  console.log(`🔗 API Base: http://localhost:${PORT}/api`);
  console.log(`=================================================`);
});
