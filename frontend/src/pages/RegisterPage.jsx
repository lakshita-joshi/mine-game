import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus } from "lucide-react";
import AuthCard from "../components/layout/AuthCard.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setSubmitting(true);
    try {
      await register(username, email, password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthCard title="Create account" subtitle="Starting balance: 1,000 coins">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Username">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            minLength={3}
            autoFocus
            className="w-full rounded-lg border border-tile-idle-border bg-abyss-edge px-3 py-2 font-mono text-sm text-ice outline-none focus-visible:border-sonar"
          />
        </Field>

        <Field label="Email">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg border border-tile-idle-border bg-abyss-edge px-3 py-2 font-mono text-sm text-ice outline-none focus-visible:border-sonar"
          />
        </Field>

        <Field label="Password">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
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
          <UserPlus size={16} />
          {submitting ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-5 text-center font-mono text-xs text-muted">
        Already have an account?{" "}
        <Link to="/login" className="text-sonar hover:underline">
          Sign in
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
