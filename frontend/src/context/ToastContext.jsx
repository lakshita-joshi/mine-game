import React, { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "info", duration = 3500) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, onRemove }) {
  if (!toasts.length) return null;
  return (
    <div
      className="fixed bottom-20 right-4 z-[9999] flex flex-col gap-2 sm:bottom-4"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }) {
  const STYLES = {
    success: "border-win/30 bg-win/10 text-win",
    error:   "border-loss/30 bg-loss/10 text-loss",
    info:    "border-gold/20 bg-gold/5 text-chalk",
    warning: "border-gold/40 bg-gold/10 text-gold",
  };
  const ICONS = { success: "✓", error: "✕", info: "ℹ", warning: "⚠" };

  return (
    <div
      className={`animate-float-up glass-heavy flex min-w-[240px] max-w-[360px] items-center gap-3 rounded-xl border px-4 py-3 shadow-xl ${
        STYLES[toast.type] || STYLES.info
      }`}
    >
      <span className="text-base">{ICONS[toast.type]}</span>
      <span className="flex-1 font-mono text-sm">{toast.message}</span>
      <button
        onClick={() => onRemove(toast.id)}
        className="ml-1 text-lg opacity-40 transition-opacity hover:opacity-100"
      >
        ×
      </button>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx.addToast;
}
