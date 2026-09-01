"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
const router = useRouter();

const [username, setUsername] = useState("");
const [password, setPassword] = useState("");
const [showPassword, setShowPassword] = useState(false);
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");

async function handleLogin(event: FormEvent<HTMLFormElement>) {
event.preventDefault();

if (!username.trim() || !password) {
  setError("Please enter your username and password.");
  return;
}

try {
  setLoading(true);
  setError("");

  const response = await fetch("/api/admin/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: username.trim(),
      password,
    }),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(
      data.error || "Invalid admin credentials."
    );
  }

  router.push("/control-center/dashboard");
  router.refresh();
} catch (err) {
  console.error("Admin login error:", err);

  setError(
    err instanceof Error
      ? err.message
      : "Unable to login."
  );
} finally {
  setLoading(false);
}

}

return ( <main className="flex min-h-screen items-center justify-center bg-slate-950 px-5 text-white"> <div className="w-full max-w-md">

```
    {/* BRAND */}
    <div className="mb-8 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10 text-3xl">
        🔐
      </div>

      <p className="mt-5 text-xs font-bold uppercase tracking-[0.25em] text-cyan-400">
        IntentCart
      </p>

      <h1 className="mt-2 text-3xl font-black tracking-tight">
        Admin Access
      </h1>

      <p className="mt-3 text-sm leading-6 text-slate-500">
        Sign in to access the IntentCart Control Center.
      </p>
    </div>

    {/* LOGIN CARD */}
    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl sm:p-8">

      <form onSubmit={handleLogin}>

        {/* USERNAME */}
        <label
          htmlFor="admin-username"
          className="text-sm font-bold text-slate-300"
        >
          Admin Username
        </label>

        <input
          id="admin-username"
          type="text"
          value={username}
          onChange={(event) =>
            setUsername(event.target.value)
          }
          placeholder="Enter admin username"
          autoComplete="username"
          disabled={loading}
          className="mt-3 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-700 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/10 disabled:cursor-not-allowed disabled:opacity-60"
        />

        {/* PASSWORD */}
        <label
          htmlFor="admin-password"
          className="mt-5 block text-sm font-bold text-slate-300"
        >
          Admin Password
        </label>

        <div className="relative mt-3">
          <input
            id="admin-password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            placeholder="Enter admin password"
            autoComplete="current-password"
            disabled={loading}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 pr-20 text-sm text-white outline-none transition placeholder:text-slate-700 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/10 disabled:cursor-not-allowed disabled:opacity-60"
          />

          <button
            type="button"
            onClick={() =>
              setShowPassword((current) => !current)
            }
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 transition hover:text-cyan-400"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3">
            <p className="text-sm font-medium leading-6 text-red-400">
              ⚠️ {error}
            </p>
          </div>
        )}

        {/* LOGIN BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 px-5 py-3.5 text-sm font-black text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950/30 border-t-slate-950" />
              Authenticating...
            </>
          ) : (
            <>
              🔓
              Access Control Center
            </>
          )}
        </button>

      </form>

      {/* SECURITY INFO */}
      <div className="mt-6 border-t border-slate-800 pt-5">
        <div className="flex gap-3">
          <span className="text-sm">🛡️</span>

          <p className="text-xs leading-5 text-slate-600">
            This area is restricted to authorized
            IntentCart administrators. Your credentials
            are securely verified before access is granted.
          </p>
        </div>
      </div>

    </div>

    {/* FOOTER */}
    <p className="mt-6 text-center text-xs text-slate-700">
      IntentCart Admin • Secure Control Center
    </p>

  </div>
</main>

);
}
