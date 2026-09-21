import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus, Eye, EyeOff } from "lucide-react";
import AuthCard from "../components/layout/AuthCard.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [username,     setUsername]     = useState("");
  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error,        setError]        = useState("");
  const [submitting,   setSubmitting]   = useState(false);

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
    <AuthCard title="Create account" subtitle="Join VaultPlay — 1,000 coins on us 🎁">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">

        <Field label="Username">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            minLength={3}
            autoFocus
            placeholder="Choose a username"
            className="w-full rounded-xl border border-rim bg-base px-4 py-3 font-mono text-sm text-chalk placeholder:text-fog outline-none transition-colors focus-visible:border-gold/60 focus-visible:ring-1 focus-visible:ring-gold/20"
          />
        </Field>

        <Field label="Email">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="your@email.com"
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
              minLength={8}
              placeholder="Min. 8 characters"
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
              Creating account…
            </>
          ) : (
            <>
              <UserPlus size={16} />
              Create Account
            </>
          )}
        </button>
      </form>

      <p className="mt-5 text-center font-mono text-xs text-fog">
        Already have an account?{" "}
        <Link to="/login" className="text-gold hover:underline">
          Sign in
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
