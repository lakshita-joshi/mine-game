import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { LogIn, Eye, EyeOff } from "lucide-react";
import AuthCard from "../components/layout/AuthCard.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const redirectTo = location.state?.from || "/dashboard";

  const [username,     setUsername]     = useState("");
  const [password,     setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error,        setError]        = useState("");
  const [submitting,   setSubmitting]   = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(username, password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthCard title="Welcome back" subtitle="Sign in to your VaultPlay account">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">

        <Field label="Username or email">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoFocus
            placeholder="Enter your username"
            className="w-full rounded-xl border border-rim bg-base px-4 py-3 font-mono text-sm text-chalk placeholder:text-fog outline-none transition-colors focus-visible:border-gold/60 focus-visible:ring-1 focus-visible:ring-gold/20"
          />
        </Field>

        <Field label="Password">
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              className="w-full rounded-xl border border-rim bg-base px-4 py-3 pr-12 font-mono text-sm text-chalk placeholder:text-fog outline-none transition-colors focus-visible:border-gold/60 focus-visible:ring-1 focus-visible:ring-gold/20"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-fog transition-colors hover:text-silver"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </Field>

        {error && (
          <div className="rounded-xl border border-loss/30 bg-loss/5 px-4 py-3">
            <p className="font-mono text-xs text-loss">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className={[
            "mt-1 flex w-full items-center justify-center gap-2 rounded-xl py-3.5",
            "font-display text-sm font-semibold uppercase tracking-wide transition-all active:scale-[0.98]",
            submitting
              ? "cursor-not-allowed bg-elevated text-fog"
              : "cursor-pointer bg-gradient-to-r from-gold to-gold-deep text-void shadow-[0_0_16px_rgba(245,200,66,0.2)] hover:shadow-[0_0_26px_rgba(245,200,66,0.38)]",
          ].join(" ")}
        >
          {submitting ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Signing in…
            </>
          ) : (
            <>
              <LogIn size={16} />
              Sign in
            </>
          )}
        </button>
      </form>

      <p className="mt-5 text-center font-mono text-xs text-fog">
        New to VaultPlay?{" "}
        <Link to="/register" className="text-gold hover:underline">
          Create an account
        </Link>
      </p>
    </AuthCard>
  );
}

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-mono text-xs uppercase tracking-wider text-fog">{label}</span>
      {children}
    </label>
  );
}
