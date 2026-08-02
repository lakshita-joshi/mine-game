import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { LogIn } from "lucide-react";
import AuthCard from "../components/layout/AuthCard.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || "/dashboard";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
    <AuthCard title="Sign in" subtitle="Dive back into the depths">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Username or email">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoFocus
            className="w-full rounded-lg border border-tile-idle-border bg-abyss-edge px-3 py-2 font-mono text-sm text-ice outline-none focus-visible:border-sonar"
          />
        </Field>

        <Field label="Password">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-lg border border-tile-idle-border bg-abyss-edge px-3 py-2 font-mono text-sm text-ice outline-none focus-visible:border-sonar"
          />
        </Field>

        {error && (
          <p className="rounded-lg border border-breach bg-[#0A1626] px-3 py-2 font-mono text-xs text-breach">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className={`mt-2 flex w-full items-center justify-center gap-2 rounded-xl py-3 font-display text-sm font-semibold uppercase tracking-wide transition-transform active:scale-95 ${
            submitting
              ? "cursor-not-allowed bg-tile-idle text-muted-dim"
              : "cursor-pointer bg-gradient-to-b from-sonar to-sonar-deep text-[#03101F]"
          }`}
        >
          <LogIn size={16} />
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="mt-5 text-center font-mono text-xs text-muted">
        New here?{" "}
        <Link to="/register" className="text-sonar hover:underline">
          Create an account
        </Link>
      </p>
    </AuthCard>
  );
}

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-mono text-xs uppercase tracking-wide text-muted">{label}</span>
      {children}
    </label>
  );
}
