import { useState, useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export function useTeenPattiSocket(tableId, setCoins) {
  const socketRef = useRef(null);
  const setCoinsRef = useRef(setCoins);
  const pendingTimerRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [table, setTable] = useState(null); // public view: seats, pot, turn, status
  const [myHand, setMyHand] = useState(null);
  const [showdownResult, setShowdownResult] = useState(null);
  const [roundResult, setRoundResult] = useState(null); // fold wins: { winnerId, amount }
  const [error, setError] = useState("");
  const [sideShowIncoming, setSideShowIncoming] = useState(null); // I'm the target: { requesterId }
  const [sideShowPending, setSideShowPending] = useState(false); // I'm the requester, waiting
  const [sideShowOutcome, setSideShowOutcome] = useState(null); // { accepted, loserId }

  // Keep the latest setCoins without re-creating the socket
  useEffect(() => {
    setCoinsRef.current = setCoins;
  }, [setCoins]);

  useEffect(() => {
    const socket = io(SOCKET_URL, { withCredentials: true });
    socketRef.current = socket;

    const clearPending = () => {
      clearTimeout(pendingTimerRef.current);
      setSideShowPending(false);
    };

    socket.on("connect", () => {
      setConnected(true);
      socket.emit("teenpatti:join", { tableId });
      socket.emit("teenpatti:request-hand", { tableId });
    });
    socket.on("disconnect", () => setConnected(false));
    socket.on("connect_error", (err) => setError(`Connection failed: ${err.message}`));

    socket.on("teenpatti:seats", setTable);
    socket.on("teenpatti:update", setTable);
    socket.on("teenpatti:round-started", (data) => {
      setTable((prev) => ({ ...prev, ...data }));
      setMyHand(null);
      setShowdownResult(null);
      setRoundResult(null);
      setSideShowIncoming(null);
      setSideShowOutcome(null);
      clearPending();
    });
    socket.on("teenpatti:private-hand", ({ hand }) => setMyHand(hand));
    socket.on("teenpatti:showdown-result", setShowdownResult);
    socket.on("teenpatti:round-result", setRoundResult);
    socket.on("teenpatti:error", ({ error }) => {
      setError(error);
      clearPending();
    });
    socket.on("teenpatti:sideshow-incoming", ({ requesterId }) =>
      setSideShowIncoming({ requesterId })
    );
    socket.on("teenpatti:sideshow-result", (res) => {
      setSideShowIncoming(null);
      clearPending();
      setSideShowOutcome(res);
    });

    // Server emits { balance } to the player after deductStake / creditPayout
    socket.on("teenpatti:balance", ({ balance }) => {
      if (typeof balance === "number") setCoinsRef.current?.(balance);
    });

    return () => {
      clearTimeout(pendingTimerRef.current);
      socket.emit("teenpatti:leave", { tableId });
      socket.disconnect();
    };
  }, [tableId]);

  const startRound = useCallback(() => {
    setError("");
    socketRef.current?.emit("teenpatti:start", { tableId });
  }, [tableId]);

  // action: "bet" (Chaal) or "fold"
  const bet = useCallback(
    (action, seesHand = false) => {
      setError("");
      socketRef.current?.emit("teenpatti:bet", { tableId, action, seesHand });
    },
    [tableId]
  );

  const seeHand = useCallback(() => {
    socketRef.current?.emit("teenpatti:see-hand", { tableId });
  }, [tableId]);

  const requestShowdown = useCallback(() => {
    setError("");
    socketRef.current?.emit("teenpatti:showdown", { tableId });
  }, [tableId]);

  const requestSideShow = useCallback(() => {
    setError("");
    setSideShowOutcome(null);
    setSideShowPending(true);
    // Never stay stuck on "waiting" if the other player never answers
    clearTimeout(pendingTimerRef.current);
    pendingTimerRef.current = setTimeout(() => setSideShowPending(false), 30000);
    socketRef.current?.emit("teenpatti:sideshow-request", { tableId });
  }, [tableId]);

  const respondToSideShow = useCallback(
    (requesterId, accepted) => {
      socketRef.current?.emit("teenpatti:sideshow-respond", { tableId, requesterId, accepted });
      setSideShowIncoming(null);
    },
    [tableId]
  );

  const leaveTable = useCallback(() => {
    socketRef.current?.emit("teenpatti:leave", { tableId });
  }, [tableId]);

  return {
    connected,
    table,
    myHand,
    showdownResult,
    roundResult,
    error,
    sideShowIncoming,
    sideShowPending,
    sideShowOutcome,
    startRound,
    bet,
    seeHand,
    requestShowdown,
    requestSideShow,
    respondToSideShow,
    leaveTable,
  };
}