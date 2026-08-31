
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
type Metrics = {
  totalRevenue: number;
  totalTransactions: number;
  averageOrderValue: number;
  successRate: number;
};

type Order = {
  id: number;
  razorpay_order_id: string;
  razorpay_payment_id: string | null;
  amount: string | number;
  currency: string;
  status: string;
  created_at: string;
};

type MetricsResponse = {
  success: boolean;
  metrics?: Metrics;
  error?: string;
};

type OrdersResponse = {
  success: boolean;
  orders?: Order[];
  error?: string;
};

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const handleLogout = () => {
    // Delete the admin authentication cookie.
    document.cookie =
      "intentcart_admin_auth=; path=/; max-age=0; SameSite=Lax";

    // Also overwrite it with an expired date for maximum browser compatibility.
    document.cookie =
      "intentcart_admin_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";

    // Send the administrator back to the login page.
    window.location.href = "/control-center";
  };

  const fetchDashboard = useCallback(async (refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const [metricsResponse, ordersResponse] =
        await Promise.all([
          fetch(`${BACKEND_URL}/api/metrics`, {
            cache: "no-store",
          }),
          fetch(`${BACKEND_URL}/api/orders`, {
            cache: "no-store",
          }),
        ]);

      if (!metricsResponse.ok) {
        throw new Error("Unable to load metrics");
      }

      if (!ordersResponse.ok) {
        throw new Error("Unable to load orders");
      }

      const metricsResult: MetricsResponse =
        await metricsResponse.json();

      const ordersResult: OrdersResponse =
        await ordersResponse.json();

      if (!metricsResult.success || !metricsResult.metrics) {
        throw new Error(
          metricsResult.error || "Metrics unavailable"
        );
      }

      setMetrics(metricsResult.metrics);

      if (
        ordersResult.success &&
        Array.isArray(ordersResult.orders)
      ) {
        setOrders(ordersResult.orders);
      }
    } catch (err) {
      console.error("Dashboard error:", err);

      setError(
        "Unable to load dashboard data. Make sure your backend is running."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();

    const interval = setInterval(() => {
      fetchDashboard(true);
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchDashboard]);

  const recentOrders = useMemo(() => {
    return [...orders]
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime()
      )
      .slice(0, 5);
  }, [orders]);

  const paidOrders = useMemo(() => {
    return orders.filter(
      (order) =>
        order.status?.toLowerCase() === "paid"
    );
  }, [orders]);

  const failedOrders = useMemo(() => {
    return orders.filter(
      (order) =>
        order.status?.toLowerCase() === "failed"
    );
  }, [orders]);

  const createdOrders = useMemo(() => {
    return orders.filter(
      (order) =>
        order.status?.toLowerCase() === "created"
    );
  }, [orders]);

  const formatCurrency = (value: number) => {
    return `₹${value.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
        <div className="text-center">
          <div className="mx-auto mb-5 h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-cyan-400" />

          <h2 className="text-xl font-semibold">
            Loading Admin Dashboard
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Loading business information...
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
        <div className="w-full max-w-lg rounded-2xl border border-red-500/20 bg-slate-900 p-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-2xl">
            ⚠️
          </div>

          <h2 className="text-xl font-semibold">
            Dashboard unavailable
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            {error}
          </p>

          <button
            onClick={() => fetchDashboard()}
            className="mt-6 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}

        <header className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
                ◈
              </span>

              <span className="text-sm font-medium text-cyan-400">
                IntentCart Admin
              </span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Business Dashboard
            </h1>

            <p className="mt-2 text-sm text-slate-400 sm:text-base">
              Monitor your store, payments and business performance.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => fetchDashboard(true)}
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-semibold transition hover:border-cyan-500/50 hover:bg-slate-800 disabled:opacity-60"
            >
              <span
                className={
                  refreshing ? "animate-spin" : ""
                }
              >
                ↻
              </span>

              {refreshing
                ? "Refreshing..."
                : "Refresh Dashboard"}
            </button>

            <button
              onClick={handleLogout}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-3 text-sm font-semibold text-red-400 transition hover:border-red-500/60 hover:bg-red-500/20"
            >
              ⇥
              Logout
            </button>
          </div>
        </header>

        {/* SYSTEM STATUS */}

        <section className="mb-6 grid gap-3 sm:grid-cols-3">
          <SystemStatus
            title="PostgreSQL"
            description="Database"
            icon="▣"
          />

          <SystemStatus
            title="Razorpay"
            description="Payments"
            icon="₹"
          />

          <SystemStatus
            title="Backend API"
            description="Server"
            icon="⚡"
          />
        </section>

        {/* LIVE STATUS */}

        <div className="mb-6 flex items-center justify-between rounded-xl border border-emerald-500/10 bg-emerald-500/5 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />

              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
            </span>

            <span className="text-xs font-medium text-emerald-300">
              Live business monitoring
            </span>
          </div>

          <span className="text-xs text-slate-500">
            Automatically updates every 10 seconds
          </span>
        </div>

        {/* MAIN METRICS */}

        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Revenue"
            value={formatCurrency(
              metrics?.totalRevenue ?? 0
            )}
            description="Successful payment revenue"
            icon="₹"
          />

          <MetricCard
            title="Transactions"
            value={(
              metrics?.totalTransactions ?? 0
            ).toString()}
            description="Recorded payments"
            icon="↗"
          />

          <MetricCard
            title="Average Order Value"
            value={formatCurrency(
              metrics?.averageOrderValue ?? 0
            )}
            description="Average successful order"
            icon="◈"
          />

          <MetricCard
            title="Success Rate"
            value={`${metrics?.successRate ?? 0}%`}
            description="Payment success rate"
            icon="✓"
          />
        </section>

        {/* ORDER STATUS */}

        <section className="mb-8 grid gap-4 sm:grid-cols-3">
          <StatusMetric
            title="Paid Orders"
            value={paidOrders.length}
            icon="✓"
            description="Successful transactions"
            type="success"
          />

          <StatusMetric
            title="Pending Orders"
            value={createdOrders.length}
            icon="◷"
            description="Orders awaiting payment"
            type="warning"
          />

          <StatusMetric
            title="Failed Orders"
            value={failedOrders.length}
            icon="!"
            description="Unsuccessful transactions"
            type="danger"
          />
        </section>

        {/* RECENT TRANSACTIONS */}

        <section className="mb-8 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
          <div className="flex flex-col gap-4 border-b border-slate-800 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400">
                Payment Activity
              </p>

              <h2 className="mt-1 text-xl font-bold">
                Recent Transactions
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Latest payments recorded by IntentCart
              </p>
            </div>

            <Link
              href="/control-center/transactions"
              className="inline-flex items-center justify-center rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-xs font-semibold text-cyan-400 transition hover:border-cyan-500/50 hover:bg-slate-800"
            >
              View All Transactions →
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <div className="text-3xl">📭</div>

              <h3 className="mt-3 font-semibold">
                No transactions yet
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Transactions will appear here after customers make payments.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left">
                <thead>
                  <tr className="border-b border-slate-800 text-xs uppercase tracking-wider text-slate-500">
                    <th className="px-6 py-4">
                      Transaction
                    </th>

                    <th className="px-6 py-4">
                      Payment ID
                    </th>

                    <th className="px-6 py-4">
                      Amount
                    </th>

                    <th className="px-6 py-4">
                      Status
                    </th>

                    <th className="px-6 py-4">
                      Date
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      onClick={() =>
                        (window.location.href =
                          `/order/${order.id}`)
                      }
                      className="cursor-pointer border-b border-slate-800/70 transition hover:bg-slate-800/30"
                    >
                      <td className="px-6 py-5">
                        <p className="font-semibold">
                          #{order.id}
                        </p>

                        <p className="mt-1 max-w-[180px] truncate text-xs text-slate-500">
                          {order.razorpay_order_id}
                        </p>
                      </td>

                      <td className="px-6 py-5">
                        <p className="max-w-[200px] truncate text-xs text-slate-400">
                          {order.razorpay_payment_id ||
                            "Not available"}
                        </p>
                      </td>

                      <td className="px-6 py-5">
                        <p className="font-semibold">
                          {formatCurrency(
                            Number(order.amount)
                          )}
                        </p>
                      </td>

                      <td className="px-6 py-5">
                        <StatusBadge
                          status={order.status}
                        />
                      </td>

                      <td className="px-6 py-5">
                        <p className="text-sm text-slate-300">
                          {new Date(
                            order.created_at
                          ).toLocaleDateString(
                            "en-IN"
                          )}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {new Date(
                            order.created_at
                          ).toLocaleTimeString(
                            "en-IN",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* ADMIN TOOLS */}

        <section className="mb-8">
          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-purple-400">
              Administration
            </p>

            <h2 className="mt-1 text-xl font-bold">
              Admin Tools
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <AdminTool
              href="/control-center/transactions"
              icon="💳"
              title="Transaction History"
              description="View, search and inspect all payment transactions."
            />

            <AdminTool
              href="/ai-insights"
              icon="✦"
              title="AI Finance Controller"
              description="Analyze revenue, risk, payment health and AI recommendations."
            />
          </div>
        </section>

        {/* FOOTER */}

        <footer className="border-t border-slate-800 pt-6 text-center text-xs text-slate-500">
          IntentCart Admin Dashboard • PostgreSQL + Razorpay
        </footer>
      </div>
    </main>
  );
}

/* ==========================================================
   SYSTEM STATUS
========================================================== */

function SystemStatus({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900 px-5 py-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-cyan-400">
          {icon}
        </div>

        <div>
          <p className="text-sm font-semibold">
            {title}
          </p>

          <p className="text-xs text-slate-500">
            {description}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs font-medium text-emerald-400">
        <span className="h-2 w-2 rounded-full bg-emerald-400" />
        Online
      </div>
    </div>
  );
}

/* ==========================================================
   METRIC CARD
========================================================== */

function MetricCard({
  title,
  value,
  description,
  icon,
}: {
  title: string;
  value: string;
  description: string;
  icon: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 transition hover:border-slate-700">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {title}
          </p>

          <p className="mt-3 text-2xl font-bold">
            {value}
          </p>
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
          {icon}
        </div>
      </div>

      <p className="mt-3 text-xs text-slate-500">
        {description}
      </p>
    </div>
  );
}

/* ==========================================================
   STATUS METRIC
========================================================== */

function StatusMetric({
  title,
  value,
  icon,
  description,
  type,
}: {
  title: string;
  value: number;
  icon: string;
  description: string;
  type: "success" | "warning" | "danger";
}) {
  const styles = {
    success:
      "border-emerald-500/20 bg-emerald-500/5 text-emerald-400",
    warning:
      "border-amber-500/20 bg-amber-500/5 text-amber-400",
    danger:
      "border-red-500/20 bg-red-500/5 text-red-400",
  };

  return (
    <div
      className={`rounded-xl border p-5 ${styles[type]}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide opacity-70">
            {title}
          </p>

          <p className="mt-3 text-3xl font-bold text-white">
            {value}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-950/50 text-lg">
          {icon}
        </div>
      </div>

      <p className="mt-3 text-xs text-slate-500">
        {description}
      </p>
    </div>
  );
}

/* ==========================================================
   ADMIN TOOL
========================================================== */

function AdminTool({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:border-cyan-500/30 hover:bg-slate-800/70"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-xl transition group-hover:bg-cyan-500/10">
          {icon}
        </div>

        <div>
          <h3 className="font-bold">
            {title}
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {description}
          </p>

          <p className="mt-4 text-xs font-semibold text-cyan-400">
            Open Tool →
          </p>
        </div>
      </div>
    </Link>
  );
}

/* ==========================================================
   STATUS BADGE
========================================================== */

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const normalized =
    status?.toLowerCase();

  if (normalized === "paid") {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        Paid
      </span>
    );
  }

  if (normalized === "failed") {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-400">
        <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
        Failed
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-400">
      <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
      {status}
    </span>
  );
}




