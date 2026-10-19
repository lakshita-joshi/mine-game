import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import minesRoutes from "./routes/minesRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import walletRoutes from "./routes/walletRoutes.js";
import { createServer } from "http";
import { Server } from "socket.io";
import { authenticateSocket } from "./utils/socketAuth.js";
import { initCrashEngine, placeBet, cashOut } from "./services/crashEngine.js";
import {
  joinTable,
  startRound,
  placeBet as placeTeenPattiBet,
  requestShowdown,
  autoFoldCurrentPlayer,
  requestSideShow,
  resolveSideShow,
  leaveTable,
  seeHand,
} from "./services/teenpattiEngine.js";
import { getBalance } from "./services/walletService.js";
import Table from "./models/Table.js";
import tableRoutes from "./routes/tableRoutes.js";
import { scheduleTurnTimeout, clearTurnTimeout } from "./utils/turnTimers.js";
import dragonTigerRoutes from "./routes/dragontigerRoutes.js";
import leaderboardRoutes from "./routes/leaderboardRoutes.js";

const app = express();

app.use(express.json());
app.use(cookieParser());
const allowedOrigins = [
  "https://mine-game-1.onrender.com",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like Postman, curl, mobile apps)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use("/api/auth", authRoutes);
app.use("/api/mines", minesRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/tables", tableRoutes);
app.use("/api/dragontiger", dragonTigerRoutes);
app.use("/api", leaderboardRoutes);

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
const lastResultRound = new Map(); // tableId -> roundNumber we already announced a fold result for
io.use(authenticateSocket);

// Strips hidden hands from the broadcast — only a player's OWN hand is
// ever sent to them (via the private-hand event), never the room.
function publicTableView(table) {
  return {
    _id: table._id,
    status: table.status,
    pot: table.pot,
    minStake: table.minStake,
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

// Announces the winner when a round ends because everyone else folded
// (Fold click, timer auto-fold, lost side show, or a player leaving).
function emitFoldResult(tableId, table) {
  if (table?.status !== "finished") return;
  const playing = table.seats.filter((s) => s.isPlaying);
  if (playing.length !== 1) return; // showdowns leave 2+ seats playing
  if (lastResultRound.get(String(tableId)) === table.roundNumber) return; // already announced
  lastResultRound.set(String(tableId), table.roundNumber);

  // pot = sum of every seat's stake, and the service zeroes it on payout
  const amount = table.seats.reduce((sum, s) => sum + (s.currentStake ?? 0), 0);
  io.to(`table:${tableId}`).emit("teenpatti:round-result", {
    winnerId: playing[0].user,
    reason: "fold",
    amount,
  });
}

// Sends each connected player their fresh wallet balance
async function emitBalances(table) {
  for (const seat of table.seats) {
    const socketId = userSockets.get(seat.user.toString());
    if (!socketId) continue;
    try {
      const balance = await getBalance(seat.user);
      io.to(socketId).emit("teenpatti:balance", { balance });
    } catch (err) {
      console.error("balance emit failed:", err.message);
    }
  }
}

function armTurnTimerIfBetting(tableId, table) {
  if (table.status === "betting") {
    scheduleTurnTimeout(tableId, async () => {
      const updated = await autoFoldCurrentPlayer(tableId);
      if (updated) {
        io.to(`table:${tableId}`).emit("teenpatti:update", publicTableView(updated));
        emitFoldResult(tableId, updated);
        await emitBalances(updated);
        armTurnTimerIfBetting(tableId, updated); // re-arm for the next player
      }
    });
  } else {
    clearTurnTimeout(tableId);
  }
}

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
          emitFoldResult(tableId, table);
          await emitBalances(table);
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
      let table;
      try {
        table = await joinTable(tableId, socket.userId);
      } catch (err) {
        // Page refresh / reconnect: already seated is fine, just re-enter the room
        if (err.message !== "Already seated") throw err;
        table = await Table.findById(tableId);
        if (!table) throw err;
      }
      socket.join(`table:${tableId}`); // scopes this socket to this table's room
      socket.joinedTables = socket.joinedTables ?? new Set();
      socket.joinedTables.add(tableId);
      io.to(`table:${tableId}`).emit("teenpatti:seats", publicTableView(table));
    } catch (err) {
      const message =
        err.name === "VersionError"
          ? "Someone else acted first — please try again"
          : err.message;
      socket.emit("teenpatti:error", { error: message });
    }
  });

  socket.on("teenpatti:start", async ({ tableId }) => {
    try {
      const table = await startRound(tableId, socket.userId);
      io.to(`table:${tableId}`).emit("teenpatti:round-started", {
        status: table.status,
        roundNumber: table.roundNumber,
        serverSeedHash: table.serverSeedHash,
        currentTurnSeatIndex: table.currentTurnSeatIndex,
        pot: table.pot,
      });
      // Refresh seats too, so folded/stake state from the last round is replaced
      io.to(`table:${tableId}`).emit("teenpatti:update", publicTableView(table));
      armTurnTimerIfBetting(tableId, table);
      for (const seat of table.seats) {
        const targetSocketId = userSockets.get(seat.user.toString());
        if (targetSocketId) {
          io.to(targetSocketId).emit("teenpatti:private-hand", { hand: seat.hand });
        }
      }
      await emitBalances(table); // boot amounts were deducted
    } catch (err) {
      const message =
        err.name === "VersionError"
          ? "Someone else acted first — please try again"
          : err.message;
      socket.emit("teenpatti:error", { error: message });
    }
  });

  // Player clicked "See cards"
  socket.on("teenpatti:see-hand", async ({ tableId }) => {
    try {
      const table = await seeHand(tableId, socket.userId);
      if (table) {
        io.to(`table:${tableId}`).emit("teenpatti:update", publicTableView(table));
      } else {
        socket.emit("teenpatti:error", { error: "Could not mark your hand as seen" });
      }
    } catch (err) {
      socket.emit("teenpatti:error", { error: err.message });
    }
  });

  socket.on("teenpatti:bet", async ({ tableId, action, seesHand }) => {
    try {
      const table = await placeTeenPattiBet(tableId, socket.userId, { action, seesHand });
      io.to(`table:${tableId}`).emit("teenpatti:update", publicTableView(table));
      emitFoldResult(tableId, table);
      armTurnTimerIfBetting(tableId, table);
      await emitBalances(table); // stake deducted, or payout if everyone else folded
    } catch (err) {
      const message =
        err.name === "VersionError"
          ? "Someone else acted first — please try again"
          : err.message;
      socket.emit("teenpatti:error", { error: message });
    }
  });

  socket.on("teenpatti:showdown", async ({ tableId }) => {
    try {
      const result = await requestShowdown(tableId, socket.userId);
      // Don't send result.table: it was loaded with every seat's hand attached
      io.to(`table:${tableId}`).emit("teenpatti:showdown-result", {
        winnerId: result.winnerId,
        serverSeed: result.serverSeed,
        hands: result.hands,
      });
      io.to(`table:${tableId}`).emit("teenpatti:update", publicTableView(result.table));
      clearTurnTimeout(tableId); // round is over, no turn to time out anymore
      await emitBalances(result.table);
    } catch (err) {
      const message =
        err.name === "VersionError"
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
        emitFoldResult(tableId, table);
        await emitBalances(table);
      }
    } catch (err) {
      console.error("teenpatti:leave failed:", err.message);
    }
  });

  socket.on("teenpatti:request-hand", async ({ tableId }) => {
    try {
      const table = await Table.findById(tableId).select("+seats.hand");
      const seat = table?.seats.find((s) => s.user.equals(socket.userId));
      // Only during an active round, so a refresh doesn't bring back old cards
      if (table?.status === "betting" && seat?.isPlaying && seat.hand?.length) {
        socket.emit("teenpatti:private-hand", { hand: seat.hand });
      }
    } catch (err) {
      console.error("request-hand failed:", err.message);
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
        emitFoldResult(tableId, result.table);
        armTurnTimerIfBetting(tableId, result.table);
        await emitBalances(result.table); // payout if the round ended
      }
    } catch (err) {
      socket.emit("teenpatti:error", { error: err.message });
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