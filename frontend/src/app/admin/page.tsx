
"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    const ADMIN_USERNAME = "admin";
    const ADMIN_PASSWORD = "IntentCart@2026";

    if (
      username.trim() !== ADMIN_USERNAME ||
      password !== ADMIN_PASSWORD
    ) {
      setError("Invalid admin username or password.");
      setLoading(false);
      return;
    }

    // Create authentication cookie.
    document.cookie =
      "intentcart_admin_auth=true; path=/; max-age=86400; SameSite=Lax";

    // Give the browser a moment to store the cookie,
    // then navigate to the protected dashboard.
    setTimeout(() => {
      window.location.href = "/admin/dashboard";
    }, 100);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
      <div className="w-full max-w-md">

        <div className="mb-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-2xl text-cyan-400">
            ✦
          </div>

          <h1 className="mt-5 text-3xl font-bold">
            IntentCart Admin
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Secure administrator access
          </p>
        </div>

        <form
          onSubmit={handleLogin}
          className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl"
        >
          <div>
            <label className="text-sm font-medium text-slate-300">
              Username
            </label>

            <input
              type="text"
              value={username}
              onChange={(event) =>
                setUsername(event.target.value)
              }
              placeholder="Enter admin username"
              autoComplete="username"
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-500"
              required
            />
          </div>

          <div className="mt-5">
            <label className="text-sm font-medium text-slate-300">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Enter admin password"
              autoComplete="current-password"
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-500"
              required
            />
          </div>

          {error && (
            <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-cyan-500 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Admin Login"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-600">
          IntentCart • Administrator Portal
        </p>

      </div>
    </main>
  );
}

