import { useState, useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import { multiplierAtElapsed } from "../utils/crashMath.js";

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export function useCrashSocket(onBalanceChange) {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [phase, setPhase] = useState("connecting"); // connecting | betting | running | crashed
  const [roundId, setRoundId] = useState(null);
  const [serverSeedHash, setServerSeedHash] = useState(null);
  const [startedAt, setStartedAt] = useState(null);
  const [liveMultiplier, setLiveMultiplier] = useState(1);
  const [crashResult, setCrashResult] = useState(null); // { crashPoint, serverSeed }
  const [myBet, setMyBet] = useState(null); // { sessionId, stake }
  const [myCashout, setMyCashout] = useState(null); // { multiplier, payout }
  const [error, setError] = useState("");
  const [history, setHistory] = useState([1.85, 2.45, 1.12, 5.2, 1.45, 3.1, 1.05]);
  const [bettingEndsAt, setBettingEndsAt] = useState(null);

  useEffect(() => {
    const socket = io(SOCKET_URL, { withCredentials: true });
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      setError("");
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    socket.on("connect_error", (err) => {
      setConnected(false);
      setError(`Server connection error: ${err.message}`);
    });

    socket.on("round:betting", ({ roundId, serverSeedHash, bettingEndsInMs  }) => {
      setPhase("betting");
      setBettingEndsAt(Date.now() + (bettingEndsInMs ?? 0));
      setRoundId(roundId);
      setServerSeedHash(serverSeedHash);
      setStartedAt(null);
      setLiveMultiplier(1);
      setCrashResult(null);
      setMyBet(null);
      setMyCashout(null);
      setError("");
    });

    socket.on("round:started", ({ startedAt }) => {
      setPhase("running");
      setStartedAt(startedAt);
      setLiveMultiplier(1);
    });

    socket.on("round:crashed", ({ crashPoint, serverSeed }) => {
      setPhase("crashed");
      setCrashResult({ crashPoint, serverSeed });
      setLiveMultiplier(crashPoint);
      if (crashPoint) {
        setHistory((prev) => [...prev.slice(-13), crashPoint]);
      }
    });

    socket.on("crash:bet:ok", (result) => {
      setMyBet(result);
      onBalanceChange?.(result.newBalance);
    });

    socket.on("crash:bet:error", ({ error }) => setError(error));

    socket.on("crash:cashout:ok", (result) => {
      setMyCashout(result);
      onBalanceChange?.(result.newBalance);
    });

    socket.on("crash:cashout:error", ({ error }) => setError(error));

    return () => socket.disconnect();
  }, [onBalanceChange]);

  // Client computes the live multiplier locally every frame using the
  // same formula the server uses to detect the crash — deterministic,
  // so no need for the server to broadcast a value 10x/second.
  useEffect(() => {
    if (phase !== "running" || !startedAt) return;
    let frame;
    const tick = () => {
      setLiveMultiplier(multiplierAtElapsed(Date.now() - startedAt));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [phase, startedAt]);

  const placeBet = useCallback((stake) => {
    setError("");
    socketRef.current?.emit("crash:bet", { stake });
  }, []);

  const cashOut = useCallback(() => {
    setError("");
    socketRef.current?.emit("crash:cashout");
  }, []);

  return {
    connected,
    phase,
    bettingEndsAt,
    roundId,
    serverSeedHash,
    liveMultiplier,
    multiplier: liveMultiplier,
    crashResult,
    myBet,
    hasBet: Boolean(myBet),
    myCashout,
    error,
    history,
    placeBet,
    cashOut,

  };
}