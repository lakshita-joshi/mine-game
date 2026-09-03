import { useState, useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export function useTeenPattiSocket(tableId) {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [table, setTable] = useState(null); // public view: seats, pot, turn, status
  const [myHand, setMyHand] = useState(null);
  const [showdownResult, setShowdownResult] = useState(null);
  const [error, setError] = useState("");
  const [sideShowIncoming, setSideShowIncoming] = useState(null); // { requesterId }

  useEffect(() => {
    const socket = io(SOCKET_URL, { withCredentials: true });
    socketRef.current = socket;

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
    });
    socket.on("teenpatti:private-hand", ({ hand }) => setMyHand(hand));
    socket.on("teenpatti:showdown-result", setShowdownResult);
    socket.on("teenpatti:error", ({ error }) => setError(error));
    socket.on("teenpatti:sideshow-incoming", ({ requesterId }) => setSideShowIncoming({ requesterId }));
    socket.on("teenpatti:sideshow-result", () => setSideShowIncoming(null));

    return () => {
      socket.emit("teenpatti:leave", { tableId });
      socket.disconnect();
    };
  }, [tableId]);

  const startRound = useCallback(() => {
    setError("");
    socketRef.current?.emit("teenpatti:start", { tableId });
  }, [tableId]);

  const bet = useCallback(
    (action, seesHand = false) => {
      setError("");
      socketRef.current?.emit("teenpatti:bet", { tableId, action, seesHand });
    },
    [tableId]
  );

  const requestShowdown = useCallback(() => {
    setError("");
    socketRef.current?.emit("teenpatti:showdown", { tableId });
  }, [tableId]);

  const requestSideShow = useCallback(() => {
    setError("");
    socketRef.current?.emit("teenpatti:sideshow-request", { tableId });
  }, [tableId]);
  
  const respondToSideShow = useCallback(
    (requesterId, accepted) => {
      socketRef.current?.emit("teenpatti:sideshow-respond", { tableId, requesterId, accepted });
      setSideShowIncoming(null);
    },
    [tableId]
  );

  return { connected, table, myHand, showdownResult, error, startRound, bet, requestShowdown, requestSideShow, respondToSideShow };
}