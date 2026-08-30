
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Order = {
  id: number;
  razorpay_order_id: string;
  razorpay_payment_id: string | null;
  amount: string | number;
  currency: string;
  status: string;
  created_at: string;
};

type Metrics = {
  totalRevenue: number;
  totalTransactions: number;
  averageOrderValue: number;
  successRate: number;
};

export default function Dashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [metrics, setMetrics] = useState<Metrics>({
    totalRevenue: 0,
    totalTransactions: 0,
    averageOrderValue: 0,
    successRate: 0,
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // ==========================================
  // FETCH DASHBOARD DATA
  // ==========================================

  const fetchDashboard = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        // ========================================
        // FETCH ORDERS
        // ========================================

        const ordersResponse = await fetch(
          "http://localhost:5000/api/orders",
          {
            cache: "no-store",
          }
        );

        if (!ordersResponse.ok) {
          throw new Error(
            "Failed to fetch orders."
          );
        }

        const ordersData =
          await ordersResponse.json();

        if (!ordersData.success) {
          throw new Error(
            ordersData.error ||
              "Failed to fetch orders."
          );
        }

        const fetchedOrders: Order[] =
          Array.isArray(ordersData.orders)
            ? ordersData.orders
            : [];

        setOrders(fetchedOrders);

        // ========================================
        // FETCH METRICS
        // ========================================

        const metricsResponse = await fetch(
          "http://localhost:5000/api/metrics",
          {
            cache: "no-store",
          }
        );

        if (!metricsResponse.ok) {
          throw new Error(
            "Failed to fetch metrics."
          );
        }

        const metricsData =
          await metricsResponse.json();

        if (!metricsData.success) {
          throw new Error(
            metricsData.error ||
              "Failed to fetch metrics."
          );
        }

        const backendMetrics =
          metricsData.metrics ||
          metricsData;

        setMetrics({
          totalRevenue:
            Number(
              backendMetrics.totalRevenue
            ) || 0,

          totalTransactions:
            Number(
              backendMetrics.totalTransactions
            ) || 0,

          averageOrderValue:
            Number(
              backendMetrics.averageOrderValue
            ) || 0,

          successRate:
            Number(
              backendMetrics.successRate
            ) || 0,
        });
      } catch (err) {
        console.error(
          "Dashboard error:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load dashboard data. Make sure the backend is running."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // ==========================================
  // SUCCESSFUL ORDERS
  // ==========================================

  const paidOrders = useMemo(() => {
    return orders.filter(
      (order) =>
        order.status.toLowerCase() ===
        "paid"
    );
  }, [orders]);

  // ==========================================
  // RECENT ORDERS
  // ==========================================

  const recentOrders = useMemo(() => {
    return [...orders]
      .sort(
        (a, b) =>
          new Date(
            b.created_at
          ).getTime() -
          new Date(
            a.created_at
          ).getTime()
      )
      .slice(0, 8);
  }, [orders]);

  // ==========================================
  // STATUS COUNTS
  // ==========================================

  const successfulPayments =
    paidOrders.length;

  const otherTransactions =
    Math.max(
      metrics.totalTransactions -
        successfulPayments,
      0
    );

  // ==========================================
  // DATE FORMAT
  // ==========================================

  const formatDate = (
    date: string
  ) => {
    return new Date(
      date
    ).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  // ==========================================
  // LOADING SCREEN
  // ==========================================

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white">

        <div className="flex min-h-screen items-center justify-center px-5">

          <div className="text-center">

            <div className="text-6xl">
              📊
            </div>

            <h1 className="mt-6 text-2xl font-black">
              Loading Dashboard
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Fetching your latest commerce
              analytics...
            </p>

          </div>

        </div>

      </main>
    );
  }

  // ==========================================
  // DASHBOARD
  // ==========================================

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      {/* ======================================
          NAVBAR
      ====================================== */}

      <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/95 backdrop-blur">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">

          <Link
            href="/products"
            className="flex items-center gap-3"
          >

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500 text-lg font-black text-slate-950">
              I
            </div>

            <div>

              <h1 className="text-lg font-bold">
                IntentCart
              </h1>

              <p className="text-[10px] uppercase tracking-widest text-slate-500">
                Smart Commerce
              </p>

            </div>

          </Link>

          <div className="flex items-center gap-3">

            <button
              onClick={() =>
                fetchDashboard(true)
              }
              disabled={refreshing}
              className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-semibold transition hover:border-cyan-500/50 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {refreshing
                ? "Refreshing..."
                : "🔄 Refresh"}
            </button>

            <Link
              href="/orders"
              className="hidden rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-400 sm:block"
            >
              📦 My Orders
            </Link>

          </div>

        </div>

      </nav>

      {/* ======================================
          CONTENT
      ====================================== */}

      <section className="mx-auto max-w-7xl px-5 py-10 sm:py-14">

        {/* ======================================
            HEADER
        ====================================== */}

        <div className="mb-10">

          <p className="text-xs font-bold uppercase tracking-widest text-cyan-400">
            Analytics
          </p>

          <div className="mt-2 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">

            <div>

              <h1 className="text-4xl font-black tracking-tight">
                Dashboard
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Monitor your IntentCart revenue,
                transactions and payment
                performance in real time.
              </p>

            </div>

            <Link
              href="/ai-insights"
              className="w-fit rounded-xl border border-purple-500/30 bg-purple-500/10 px-5 py-3 text-sm font-bold text-purple-400 transition hover:bg-purple-500/20"
            >
              🤖 AI Insights →
            </Link>

          </div>

        </div>

        {/* ======================================
            ERROR
        ====================================== */}

        {error && (

          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-5">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <p className="font-bold text-red-400">
                  Dashboard Error
                </p>

                <p className="mt-1 text-sm text-red-400/80">
                  {error}
                </p>

              </div>

              <button
                onClick={() =>
                  fetchDashboard()
                }
                className="w-fit rounded-xl bg-red-500 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-red-400"
              >
                Try Again
              </button>

            </div>

          </div>

        )}

        {/* ======================================
            METRIC CARDS
        ====================================== */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

          {/* REVENUE */}

          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 transition hover:border-emerald-500/30">

            <div className="flex items-center justify-between">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-2xl">
                💰
              </div>

              <span className="text-xs font-bold uppercase tracking-widest text-slate-600">
                Revenue
              </span>

            </div>

            <p className="mt-6 text-sm font-medium text-slate-500">
              Total Revenue
            </p>

            <p className="mt-2 text-3xl font-black">
              ₹
              {metrics.totalRevenue.toLocaleString(
                "en-IN",
                {
                  maximumFractionDigits: 2,
                }
              )}
            </p>

            <p className="mt-2 text-xs text-slate-600">
              From successful payments
            </p>

          </div>

          {/* TRANSACTIONS */}

          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 transition hover:border-cyan-500/30">

            <div className="flex items-center justify-between">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10 text-2xl">
                🧾
              </div>

              <span className="text-xs font-bold uppercase tracking-widest text-slate-600">
                Orders
              </span>

            </div>

            <p className="mt-6 text-sm font-medium text-slate-500">
              Total Transactions
            </p>

            <p className="mt-2 text-3xl font-black">
              {metrics.totalTransactions}
            </p>

            <p className="mt-2 text-xs text-slate-600">
              All recorded orders
            </p>

          </div>

          {/* AOV */}

          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 transition hover:border-purple-500/30">

            <div className="flex items-center justify-between">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/10 text-2xl">
                📊
              </div>

              <span className="text-xs font-bold uppercase tracking-widest text-slate-600">
                AOV
              </span>

            </div>

            <p className="mt-6 text-sm font-medium text-slate-500">
              Average Order Value
            </p>

            <p className="mt-2 text-3xl font-black">
              ₹
              {metrics.averageOrderValue.toLocaleString(
                "en-IN",
                {
                  maximumFractionDigits: 2,
                }
              )}
            </p>

            <p className="mt-2 text-xs text-slate-600">
              Based on successful orders
            </p>

          </div>

          {/* SUCCESS RATE */}

          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 transition hover:border-emerald-500/30">

            <div className="flex items-center justify-between">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-2xl">
                ✅
              </div>

              <span className="text-xs font-bold uppercase tracking-widest text-slate-600">
                Success
              </span>

            </div>

            <p className="mt-6 text-sm font-medium text-slate-500">
              Payment Success Rate
            </p>

            <p className="mt-2 text-3xl font-black text-emerald-400">
              {metrics.successRate.toFixed(1)}%
            </p>

            <p className="mt-2 text-xs text-slate-600">
              {successfulPayments} successful of{" "}
              {metrics.totalTransactions}{" "}
              transactions
            </p>

          </div>

        </div>

        {/* ======================================
            QUICK ACTIONS
        ====================================== */}

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">

          <Link
            href="/products"
            className="group rounded-2xl border border-slate-800 bg-slate-900 p-5 transition hover:border-cyan-500/40 hover:bg-slate-900/80"
          >

            <div className="flex items-center gap-4">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10 text-xl transition group-hover:scale-105">
                🛍️
              </div>

              <div>

                <p className="font-bold">
                  Shop Products
                </p>

                <p className="mt-1 text-xs text-slate-600">
                  Browse the catalog
                </p>

              </div>

            </div>

          </Link>

          <Link
            href="/orders"
            className="group rounded-2xl border border-slate-800 bg-slate-900 p-5 transition hover:border-purple-500/40 hover:bg-slate-900/80"
          >

            <div className="flex items-center gap-4">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/10 text-xl transition group-hover:scale-105">
                📦
              </div>

              <div>

                <p className="font-bold">
                  Order History
                </p>

                <p className="mt-1 text-xs text-slate-600">
                  View all purchases
                </p>

              </div>

            </div>

          </Link>

          <Link
            href="/transactions"
            className="group rounded-2xl border border-slate-800 bg-slate-900 p-5 transition hover:border-emerald-500/40 hover:bg-slate-900/80"
          >

            <div className="flex items-center gap-4">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-xl transition group-hover:scale-105">
                💳
              </div>

              <div>

                <p className="font-bold">
                  Transactions
                </p>

                <p className="mt-1 text-xs text-slate-600">
                  Review payment activity
                </p>

              </div>

            </div>

          </Link>

        </div>

        {/* ======================================
            RECENT ORDERS
        ====================================== */}

        <div className="mt-8 overflow-hidden rounded-3xl border border-slate-800 bg-slate-900">

          <div className="flex flex-col gap-3 border-b border-slate-800 p-6 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <p className="text-xs font-bold uppercase tracking-widest text-cyan-400">
                Activity
              </p>

              <h2 className="mt-1 text-xl font-black">
                Recent Orders
              </h2>

            </div>

            <Link
              href="/orders"
              className="text-sm font-bold text-cyan-400 hover:text-cyan-300"
            >
              View All →
            </Link>

          </div>

          {recentOrders.length === 0 ? (

            <div className="px-6 py-20 text-center">

              <div className="text-6xl">
                📦
              </div>

              <h3 className="mt-5 text-xl font-bold">
                No transactions yet
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Your payment activity will
                appear here after your first
                purchase.
              </p>

              <Link
                href="/products"
                className="mt-6 inline-block rounded-xl bg-cyan-500 px-6 py-3 font-bold text-slate-950 transition hover:bg-cyan-400"
              >
                🛍️ Start Shopping
              </Link>

            </div>

          ) : (

            <div className="divide-y divide-slate-800">

              {recentOrders.map(
                (order) => (

                  <div
                    key={order.id}
                    className="flex flex-col gap-4 p-5 transition hover:bg-slate-950/40 sm:flex-row sm:items-center sm:justify-between"
                  >

                    <div className="flex min-w-0 items-center gap-4">

                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-xl">
                        📦
                      </div>

                      <div className="min-w-0">

                        <div className="flex flex-wrap items-center gap-2">

                          <p className="font-bold">
                            Order #{order.id}
                          </p>

                          {order.status.toLowerCase() ===
                          "paid" ? (

                            <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold uppercase text-emerald-400">
                              Paid
                            </span>

                          ) : (

                            <span className="rounded-full bg-yellow-500/10 px-2.5 py-1 text-[10px] font-bold uppercase text-yellow-400">
                              {order.status}
                            </span>

                          )}

                        </div>

                        <p className="mt-1 text-xs text-slate-600">
                          {formatDate(
                            order.created_at
                          )}
                        </p>

                      </div>

                    </div>

                    <div className="flex items-center justify-between gap-5 sm:justify-end">

                      <div className="text-left sm:text-right">

                        <p className="font-black">
                          ₹
                          {Number(
                            order.amount
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </p>

                        <p className="mt-1 text-[10px] uppercase tracking-wider text-slate-600">
                          {order.currency}
                        </p>

                      </div>

                      <Link
                        href={`/orders/${order.id}`}
                        className="rounded-xl border border-slate-700 px-4 py-2.5 text-xs font-bold transition hover:border-cyan-500/50 hover:bg-slate-800"
                      >
                        Details →
                      </Link>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </div>

        {/* ======================================
            PERFORMANCE SUMMARY
        ====================================== */}

        <div className="mt-8 rounded-3xl border border-slate-800 bg-slate-900 p-6">

          <div className="mb-6">

            <p className="text-xs font-bold uppercase tracking-widest text-purple-400">
              Performance
            </p>

            <h2 className="mt-1 text-xl font-black">
              Payment Overview
            </h2>

          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">

            {/* SUCCESSFUL */}

            <div>

              <p className="text-sm text-slate-500">
                Successful Payments
              </p>

              <p className="mt-2 text-2xl font-black text-emerald-400">
                {successfulPayments}
              </p>

              <p className="mt-1 text-xs text-slate-600">
                Completed successfully
              </p>

            </div>

            {/* OTHER */}

            <div>

              <p className="text-sm text-slate-500">
                Pending / Other
              </p>

              <p className="mt-2 text-2xl font-black text-yellow-400">
                {otherTransactions}
              </p>

              <p className="mt-1 text-xs text-slate-600">
                Not marked as paid
              </p>

            </div>

            {/* RATE */}

            <div>

              <p className="text-sm text-slate-500">
                Success Rate
              </p>

              <p className="mt-2 text-2xl font-black text-cyan-400">
                {metrics.successRate.toFixed(
                  1
                )}
                %
              </p>

              <p className="mt-1 text-xs text-slate-600">
                Overall payment performance
              </p>

            </div>

          </div>

          {/* PROGRESS BAR */}

          <div className="mt-7">

            <div className="mb-2 flex justify-between text-xs">

              <span className="text-slate-500">
                Payment performance
              </span>

              <span className="font-bold text-emerald-400">
                {metrics.successRate.toFixed(
                  1
                )}
                %
              </span>

            </div>

            <div className="h-2 overflow-hidden rounded-full bg-slate-800">

              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                style={{
                  width: `${Math.min(
                    Math.max(
                      metrics.successRate,
                      0
                    ),
                    100
                  )}%`,
                }}
              />

            </div>

          </div>

        </div>

        {/* ======================================
            DATA SOURCE
        ====================================== */}

        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/50 p-4">

          <div className="flex items-center gap-3">

            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-sm">
              ●
            </div>

            <div>

              <p className="text-xs font-bold text-slate-300">
                Live Database Analytics
              </p>

              <p className="mt-0.5 text-[11px] text-slate-600">
                Dashboard metrics are loaded from
                your IntentCart backend and
                PostgreSQL database.
              </p>

            </div>

          </div>

        </div>

      </section>

      {/* ======================================
          FOOTER
      ====================================== */}

      <footer className="border-t border-slate-800">

        <div className="mx-auto max-w-7xl px-5 py-8 text-center">

          <p className="font-semibold">
            IntentCart
          </p>

          <p className="mt-1 text-xs text-slate-600">
            AI-powered commerce platform
          </p>

        </div>

      </footer>

    </main>
  );
}
