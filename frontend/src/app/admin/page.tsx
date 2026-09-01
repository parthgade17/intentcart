"use client";

import { useState } from "react";

export default function AdminLoginPage() {
const [username, setUsername] = useState("");
const [password, setPassword] = useState("");
const [showPassword, setShowPassword] = useState(false);
const [error, setError] = useState("");
const [loading, setLoading] = useState(false);

async function handleLogin(
event: React.FormEvent<HTMLFormElement>
) {
event.preventDefault();

setError("");
setLoading(true);

try {
  const response = await fetch(
    "/api/admin/login",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username.trim(),
        password,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok || !data.success) {
    setError(
      data.error ||
        "Invalid admin username or password."
    );
    setLoading(false);
    return;
  }

  window.location.href =
    "/control-center/dashboard";
} catch (error) {
  console.error(
    "ADMIN LOGIN ERROR:",
    error
  );

  setError(
    "Unable to connect to the login service."
  );

  setLoading(false);
}


}

return ( <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-6 text-white">

  {/* Background Glow */}

  <div className="pointer-events-none absolute inset-0 overflow-hidden">
    <div className="absolute left-1/2 top-[-180px] h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl" />

    <div className="absolute bottom-[-180px] right-[-120px] h-[400px] w-[400px] rounded-full bg-blue-500/5 blur-3xl" />
  </div>

  <div className="relative w-full max-w-md">

    {/* Header */}

    <div className="mb-8 text-center">

      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10 text-3xl text-cyan-400 shadow-lg shadow-cyan-500/5">
        ✦
      </div>

      <p className="mt-6 text-xs font-bold uppercase tracking-[0.25em] text-cyan-400">
        IntentCart
      </p>

      <h1 className="mt-2 text-3xl font-black tracking-tight">
        Admin Control Center
      </h1>

      <p className="mt-3 text-sm leading-6 text-slate-500">
        Sign in to securely manage transactions,
        orders and business insights.
      </p>

    </div>

    {/* Login Card */}

    <form
      onSubmit={handleLogin}
      className="rounded-3xl border border-slate-800 bg-slate-900/90 p-7 shadow-2xl shadow-black/30 backdrop-blur-xl"
    >

      {/* Security Badge */}

      <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-500/10 bg-emerald-500/5 px-4 py-3">

        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
          🔒
        </div>

        <div>
          <p className="text-xs font-bold text-emerald-400">
            Secure Administrator Login
          </p>

          <p className="mt-0.5 text-[11px] text-slate-600">
            Protected authentication
          </p>
        </div>

      </div>

      {/* Username */}

      <div>

        <label
          htmlFor="username"
          className="text-sm font-semibold text-slate-300"
        >
          Username
        </label>

        <div className="relative mt-2">

          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-600">
            👤
          </span>

          <input
            id="username"
            type="text"
            value={username}
            onChange={(event) =>
              setUsername(event.target.value)
            }
            placeholder="Enter admin username"
            autoComplete="username"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3.5 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-700 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/10"
            required
          />

        </div>

      </div>

      {/* Password */}

      <div className="mt-5">

        <label
          htmlFor="password"
          className="text-sm font-semibold text-slate-300"
        >
          Password
        </label>

        <div className="relative mt-2">

          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-600">
            🔑
          </span>

          <input
            id="password"
            type={
              showPassword
                ? "text"
                : "password"
            }
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            placeholder="Enter admin password"
            autoComplete="current-password"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3.5 pl-11 pr-16 text-sm text-white outline-none transition placeholder:text-slate-700 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/10"
            required
          />

          <button
            type="button"
            onClick={() =>
              setShowPassword(
                (current) => !current
              )
            }
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-semibold text-slate-500 transition hover:bg-slate-800 hover:text-cyan-400"
          >
            {showPassword
              ? "Hide"
              : "Show"}
          </button>

        </div>

      </div>

      {/* Error */}

      {error && (
        <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">

          <span className="text-sm">
            ⚠️
          </span>

          <p className="text-sm leading-5 text-red-400">
            {error}
          </p>

        </div>
      )}

      {/* Login Button */}

      <button
        type="submit"
        disabled={loading}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-3.5 text-sm font-black text-slate-950 transition hover:bg-cyan-300 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950/30 border-t-slate-950" />
            Signing in...
          </>
        ) : (
          <>
            Sign in to Control Center
            <span className="text-lg">
              →
            </span>
          </>
        )}
      </button>

    </form>

    {/* Footer */}

    <div className="mt-6 text-center">

      <p className="text-xs text-slate-700">
        IntentCart • Administrator Portal
      </p>

      <p className="mt-2 text-[10px] text-slate-800">
        Authorized access only
      </p>

    </div>

  </div>

</main>

);
}
