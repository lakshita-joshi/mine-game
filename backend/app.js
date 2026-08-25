import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import minesRoutes from "./routes/minesRoutes.js";
import authRoutes from './routes/authRoutes.js';
import adminRoutes from "./routes/adminRoutes.js";
import walletRoutes from "./routes/walletRoutes.js";
import { createServer } from "http";
import { Server } from "socket.io";
import { authenticateSocket } from "./utils/socketAuth.js";
import { initCrashEngine, placeBet, cashOut } from "./services/crashEngine.js";

const app = express();

app.use(express.json());
app.use(cookieParser());
const allowedOrigins = [
  "https://mine-game-1.onrender.com",
  "http://localhost:5173"
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like Postman, curl, mobile apps)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));
app.use('/api/auth', authRoutes);
app.use("/api/mines", minesRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/wallet", walletRoutes);

app.get("/health", (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT ?? 5000;

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173", credentials: true },
});

io.use(authenticateSocket);

io.on("connection", (socket) => {
  socket.on("crash:bet", async ({ stake }) => {
    try {
      const result = await placeBet(socket.userId, stake);
      socket.emit("crash:bet:ok", result);
    } catch (err) {
      socket.emit("crash:bet:error", { error: err.message });
    }
  });

  socket.on("crash:cashout", async () => {
    try {
      const result = await cashOut(socket.userId);
      socket.emit("crash:cashout:ok", result);
    } catch (err) {
      socket.emit("crash:cashout:error", { error: err.message });
    }
  });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      initCrashEngine(io);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err.message);
    process.exit(1);
  });

export default app;
