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
import { joinTable, startRound, placeBet as placeTeenPattiBet, requestShowdown } from "./services/teenpattiEngine.js";
import Table from "./models/Table.js";
import tableRoutes from "./routes/tableRoutes.js";
import { autoFoldCurrentPlayer, requestSideShow, resolveSideShow, leaveTable } from "./services/teenpattiEngine.js";
import { scheduleTurnTimeout, clearTurnTimeout } from "./utils/turnTimers.js";

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
app.use("/api/tables", tableRoutes);

app.get("/health", (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT ?? 5000;

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  },
});
const userSockets = new Map(); // userId -> socket.id, so we can message one specific player

io.use(authenticateSocket);

io.on("connection", (socket) => {
  userSockets.set(socket.userId, socket.id);

  socket.on("disconnect", async () => {
    if (userSockets.get(socket.userId) === socket.id) {
      userSockets.delete(socket.userId);
    }
    for (const tableId of socket.joinedTables ?? []) {
      try {
        const table = await leaveTable(tableId, socket.userId);
        if (table) {
          io.to(`table:${tableId}`).emit("teenpatti:update", publicTableView(table));
        }
      } catch (err) {
        console.error("leaveTable failed on disconnect:", err.message);
      }
    }
  });

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

  socket.on("teenpatti:join", async ({ tableId }) => {
  try {
    const table = await joinTable(tableId, socket.userId);
    socket.join(`table:${tableId}`); // scopes this socket to this table's room
    socket.joinedTables = socket.joinedTables ?? new Set();
    socket.joinedTables.add(tableId);
    io.to(`table:${tableId}`).emit("teenpatti:seats", publicTableView(table));
  } catch (err) {
    const message = err.name === "VersionError"
      ? "Someone else acted first — please try again"
      : err.message;
    socket.emit("teenpatti:error", { error: message });
  }
  });

  socket.on("teenpatti:start", async ({ tableId }) => {
    try {
      const table = await startRound(tableId);
      io.to(`table:${tableId}`).emit("teenpatti:round-started", {
        status: table.status,
        roundNumber: table.roundNumber,
        serverSeedHash: table.serverSeedHash,
        currentTurnSeatIndex: table.currentTurnSeatIndex,
        pot: table.pot,
      });
      armTurnTimerIfBetting(tableId, table);
      for (const seat of table.seats) {
        const targetSocketId = userSockets.get(seat.user.toString());
        if (targetSocketId) {
          io.to(targetSocketId).emit("teenpatti:private-hand", { hand: seat.hand });
        }
      }
    } catch (err) {
      const message = err.name === "VersionError"
        ? "Someone else acted first — please try again"
        : err.message;
      socket.emit("teenpatti:error", { error: message });
    }
  });

  socket.on("teenpatti:bet", async ({ tableId, action, seesHand }) => {
    try {
      const table = await placeTeenPattiBet(tableId, socket.userId, { action, seesHand });
      io.to(`table:${tableId}`).emit("teenpatti:update", publicTableView(table));
      armTurnTimerIfBetting(tableId, table);
    } catch (err) {
      const message = err.name === "VersionError"
        ? "Someone else acted first — please try again"
        : err.message;
      socket.emit("teenpatti:error", { error: message });
    }
  });

  socket.on("teenpatti:showdown", async ({ tableId }) => {
    try {
      const result = await requestShowdown(tableId, socket.userId);
      io.to(`table:${tableId}`).emit("teenpatti:showdown-result", result);
      io.to(`table:${tableId}`).emit("teenpatti:update", publicTableView(result.table));
      clearTurnTimeout(tableId); // round is over, no turn to time out anymore
    } catch (err) {
      const message = err.name === "VersionError"
        ? "Someone else acted first — please try again"
        : err.message;
      socket.emit("teenpatti:error", { error: message });
    }
  });
  socket.on("teenpatti:leave", async ({ tableId }) => {
    socket.leave(`table:${tableId}`);
    try {
      const table = await leaveTable(tableId, socket.userId);
      if (table) {
        io.to(`table:${tableId}`).emit("teenpatti:update", publicTableView(table));
      }
    } catch (err) {
      console.error("teenpatti:leave failed:", err.message);
    }
  });
  socket.on("teenpatti:request-hand", async ({ tableId }) => {
    const table = await Table.findById(tableId).select("+seats.hand");
    const seat = table?.seats.find((s) => s.user.equals(socket.userId));
    if (seat?.isPlaying && seat.hand?.length) {
      socket.emit("teenpatti:private-hand", { hand: seat.hand });
    }
  });

  socket.on("teenpatti:sideshow-request", async ({ tableId }) => {
    try {
      const { requesterId, targetId } = await requestSideShow(tableId, socket.userId);
      const targetSocketId = userSockets.get(targetId.toString());
      if (targetSocketId) {
        io.to(targetSocketId).emit("teenpatti:sideshow-incoming", { tableId, requesterId });
      } else {
        socket.emit("teenpatti:error", { error: "That player is not currently connected" });
      }
    } catch (err) {
      socket.emit("teenpatti:error", { error: err.message });
    }
  });
  
  socket.on("teenpatti:sideshow-respond", async ({ tableId, requesterId, accepted }) => {
    try {
      const result = await resolveSideShow(tableId, requesterId, socket.userId, accepted);
      io.to(`table:${tableId}`).emit("teenpatti:sideshow-result", {
        accepted: result.accepted,
        loserId: result.loserId ?? null,
      });
      if (result.accepted) {
        io.to(`table:${tableId}`).emit("teenpatti:update", publicTableView(result.table));
        armTurnTimerIfBetting(tableId, result.table);
      }
    } catch (err) {
      socket.emit("teenpatti:error", { error: err.message });
    }
  });
});

// Strips hidden hands from the broadcast — only a player's OWN hand is
// ever sent to them (via the private-hand event above), never the room.
function publicTableView(table) {
  return {
    _id: table._id,
    status: table.status,
    pot: table.pot,
    currentTurnSeatIndex: table.currentTurnSeatIndex,
    roundNumber: table.roundNumber,
    seats: table.seats.map((s) => ({
      user: s.user,
      seatIndex: s.seatIndex,
      isPlaying: s.isPlaying,
      hasSeenHand: s.hasSeenHand,
      currentStake: s.currentStake,
    })),
  };
}
function armTurnTimerIfBetting(tableId, table) {
  if (table.status === "betting") {
    scheduleTurnTimeout(tableId, async () => {
      const updated = await autoFoldCurrentPlayer(tableId);
      if (updated) {
        io.to(`table:${tableId}`).emit("teenpatti:update", publicTableView(updated));
        armTurnTimerIfBetting(tableId, updated); // re-arm for the next player
      }
    });
  } else {
    clearTurnTimeout(tableId);
  }
}

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
