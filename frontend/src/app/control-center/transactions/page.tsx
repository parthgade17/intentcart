"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

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

type OrdersResponse = {
  success: boolean;
  orders?: Order[];
  error?: string;
};

export default function TransactionsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadTransactions = useCallback(
    async (refresh = false) => {
      try {
        if (refresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

          const response = await fetch(
            "/api/admin/orders",
            {
              cache: "no-store",
            }
          );

        const data: OrdersResponse =
          await response.json();

        console.log(
          "TRANSACTIONS:",
          data
        );

        if (!response.ok || !data.success) {
          throw new Error(
            data.error ||
              "Failed to load transactions."
          );
        }

        setOrders(
          Array.isArray(data.orders)
            ? data.orders
            : []
        );
      } catch (err) {
        console.error(
          "TRANSACTION ERROR:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load transactions."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    loadTransactions();

    const interval = setInterval(() => {
      loadTransactions(true);
    }, 10000);

    return () => clearInterval(interval);
  }, [loadTransactions]);

  // =====================================================
  // CALCULATIONS
  // =====================================================

  const paidOrders = useMemo(
    () =>
      orders.filter(
        (order) =>
          order.status?.toLowerCase() ===
          "paid"
      ),
    [orders]
  );

  const createdOrders = useMemo(
    () =>
      orders.filter(
        (order) =>
          order.status?.toLowerCase() ===
          "created"
      ),
    [orders]
  );

  const failedOrders = useMemo(
    () =>
      orders.filter(
        (order) =>
          order.status?.toLowerCase() ===
          "failed"
      ),
    [orders]
  );

  const totalRevenue = useMemo(
    () =>
      paidOrders.reduce(
        (total, order) =>
          total + Number(order.amount || 0),
        0
      ),
    [paidOrders]
  );

  const averageOrderValue = useMemo(() => {
    if (paidOrders.length === 0) {
      return 0;
    }

    return totalRevenue / paidOrders.length;
  }, [totalRevenue, paidOrders]);

  const successRate = useMemo(() => {
    if (orders.length === 0) {
      return 0;
    }

    return (
      (paidOrders.length / orders.length) *
      100
    );
  }, [orders, paidOrders]);

  const filteredOrders = useMemo(() => {
    const sorted = [...orders].sort(
      (a, b) =>
        new Date(b.created_at).getTime() -
        new Date(a.created_at).getTime()
    );

    if (filter === "all") {
      return sorted;
    }

    return sorted.filter(
      (order) =>
        order.status?.toLowerCase() ===
        filter
    );
  }, [orders, filter]);

  // =====================================================
  // FORMATTERS
  // =====================================================

  const currency = (value: number) =>
    `₹${value.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const dateTime = (value: string) => {
    const date = new Date(value);

    return {
      date: date.toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      ),

      time: date.toLocaleTimeString(
        "en-IN",
        {
          hour: "2-digit",
          minute: "2-digit",
        }
      ),
    };
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">

        <div className="text-center">

          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-800 border-t-cyan-400" />

          <h1 className="mt-6 text-xl font-bold">
            Loading Transactions
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Connecting to PostgreSQL...
          </p>

        </div>

      </main>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">

        <div className="w-full max-w-lg rounded-3xl border border-red-500/20 bg-slate-900 p-8 text-center">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-3xl">
            ⚠️
          </div>

          <h1 className="mt-6 text-2xl font-black">
            Transactions Unavailable
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-400">
            {error}
          </p>

          <button
            onClick={() =>
              loadTransactions()
            }
            className="mt-7 rounded-xl bg-cyan-400 px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300"
          >
            Try Again
          </button>

          <div className="mt-5">
            <Link
              href="/control-center/dashboard"
              className="text-sm font-medium text-cyan-400 hover:text-cyan-300"
            >
              ← Back to Control Center
            </Link>
          </div>

        </div>

      </main>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur-xl">

        <div className="mx-auto max-w-7xl px-5 py-5">

          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <Link
                href="/control-center/dashboard"
                className="text-sm text-cyan-400 hover:text-cyan-300"
              >
                ← Control Center
              </Link>

              <div className="mt-5 flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10 text-xl text-cyan-400">
                  ₹
                </div>

                <div>

                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
                    IntentCart Admin
                  </p>

                  <h1 className="mt-1 text-3xl font-black tracking-tight md:text-4xl">
                    Transactions
                  </h1>

                </div>

              </div>

              <p className="mt-3 max-w-2xl text-sm text-slate-500">
                Monitor Razorpay payments and PostgreSQL order records in real time.
              </p>

            </div>

            <button
              onClick={() =>
                loadTransactions(true)
              }
              disabled={refreshing}
              className="rounded-xl border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-bold transition hover:border-cyan-500/40 hover:bg-slate-800 disabled:opacity-50"
            >
              {refreshing
                ? "↻ Refreshing..."
                : "↻ Refresh"}
            </button>

          </div>

        </div>

      </header>

      <div className="mx-auto max-w-7xl px-5 py-8">

        {/* =================================================
            LIVE MONITORING
        ================================================= */}

        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-emerald-500/10 bg-emerald-500/5 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-center gap-3">

            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />

              <span className="relative h-2.5 w-2.5 rounded-full bg-emerald-400" />
            </span>

            <span className="text-sm font-semibold text-emerald-300">
              Live transaction monitoring
            </span>

          </div>

          <span className="text-xs text-slate-500">
            Auto-refresh every 10 seconds
          </span>

        </div>

        {/* =================================================
            METRICS
        ================================================= */}

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <Metric
            title="Total Transactions"
            value={orders.length.toString()}
            icon="↗"
          />

          <Metric
            title="Successful Payments"
            value={paidOrders.length.toString()}
            icon="✓"
            type="success"
          />

          <Metric
            title="Total Revenue"
            value={currency(totalRevenue)}
            icon="₹"
          />

          <Metric
            title="Success Rate"
            value={`${successRate.toFixed(1)}%`}
            icon="%"
            type="success"
          />

        </section>

        {/* =================================================
            SECONDARY METRICS
        ================================================= */}

        <section className="mt-4 grid gap-4 sm:grid-cols-3">

          <SmallMetric
            title="Pending Orders"
            value={createdOrders.length}
            description="Awaiting payment"
            type="warning"
          />

          <SmallMetric
            title="Failed Payments"
            value={failedOrders.length}
            description="Unsuccessful transactions"
            type="danger"
          />

          <SmallMetric
            title="Average Order Value"
            value={currency(averageOrderValue)}
            description="Across successful payments"
          />

        </section>

        {/* =================================================
            FILTERS
        ================================================= */}

        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-5">

          <div className="mb-4">

            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
              Filter
            </p>

            <h2 className="mt-1 text-lg font-bold">
              Transaction Status
            </h2>

          </div>

          <div className="flex flex-wrap gap-3">

            {[
              ["all", "All", orders.length],
              ["paid", "Paid", paidOrders.length],
              ["created", "Created", createdOrders.length],
              ["failed", "Failed", failedOrders.length],
            ].map(
              ([value, label, count]) => (
                <button
                  key={String(value)}
                  onClick={() =>
                    setFilter(String(value))
                  }
                  className={`rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                    filter === value
                      ? "bg-cyan-400 text-slate-950"
                      : "bg-slate-950 text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  {label}{" "}
                  <span className="ml-1 opacity-60">
                    {count}
                  </span>
                </button>
              )
            )}

          </div>

        </section>

        {/* =================================================
            TRANSACTIONS LIST
        ================================================= */}

        <section className="mt-6 overflow-hidden rounded-3xl border border-slate-800 bg-slate-900">

          <div className="border-b border-slate-800 px-6 py-6">

            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
              PostgreSQL Records
            </p>

            <h2 className="mt-1 text-2xl font-black">
              Transaction History
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Select a transaction to view complete order details.
            </p>

          </div>

          {filteredOrders.length === 0 ? (

            <div className="px-6 py-20 text-center">

              <div className="text-5xl">
                📭
              </div>

              <h3 className="mt-5 text-lg font-bold">
                No Transactions
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                No transactions match the selected filter.
              </p>

            </div>

          ) : (

            <div className="divide-y divide-slate-800">

              {filteredOrders.map(
                (order) => {

                  const formatted =
                    dateTime(
                      order.created_at
                    );

                  const status =
                    order.status?.toLowerCase();

                  return (
                    <Link
                      key={order.id}
                      href={`/order/${order.id}`}
                      className="block transition hover:bg-slate-800/50"
                    >

                      <div className="p-6">

                        <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">

                          {/* LEFT */}

                          <div className="flex min-w-0 items-start gap-4">

                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-800 font-black text-cyan-400">
                              #{order.id}
                            </div>

                            <div className="min-w-0">

                              <p className="font-bold">
                                Transaction #{order.id}
                              </p>

                              <p className="mt-1 truncate font-mono text-xs text-slate-500 sm:max-w-[420px]">
                                {order.razorpay_order_id}
                              </p>

                              <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-600">

                                <span>
                                  {formatted.date}
                                </span>

                                <span>
                                  •
                                </span>

                                <span>
                                  {formatted.time}
                                </span>

                              </div>

                            </div>

                          </div>

                          {/* RIGHT */}

                          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">

                            <div className="sm:text-right">

                              <p className="text-xl font-black">
                                {currency(
                                  Number(
                                    order.amount
                                  )
                                )}
                              </p>

                              <p className="text-xs text-slate-600">
                                {order.currency}
                              </p>

                            </div>

                            <StatusBadge
                              status={status}
                            />

                            <span className="hidden text-xl text-slate-600 sm:block">
                              →
                            </span>

                          </div>

                        </div>

                        {/* PAYMENT ID */}

                        <div className="mt-5 border-t border-slate-800 pt-4">

                          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">

                            <span className="text-xs font-semibold text-slate-600">
                              Razorpay Payment ID
                            </span>

                            <span className="break-all font-mono text-xs text-slate-500 sm:text-right">
                              {order.razorpay_payment_id ||
                                "Not available"}
                            </span>

                          </div>

                        </div>

                      </div>

                    </Link>
                  );
                }
              )}

            </div>
          )}

        </section>

        {/* FOOTER */}

        <footer className="mt-8 border-t border-slate-900 pt-7 text-center">

          <p className="text-xs text-slate-700">
            IntentCart Admin • PostgreSQL + Razorpay
          </p>

        </footer>

      </div>
    </main>
  );
}

// =====================================================
// METRIC
// =====================================================

function Metric({
  title,
  value,
  icon,
  type = "default",
}: {
  title: string;
  value: string;
  icon: string;
  type?: "default" | "success";
}) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        type === "success"
          ? "border-emerald-500/20 bg-emerald-500/5"
          : "border-slate-800 bg-slate-900"
      }`}
    >

      <div className="flex items-start justify-between">

        <div>

          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {title}
          </p>

          <p className="mt-3 text-2xl font-black">
            {value}
          </p>

        </div>

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${
            type === "success"
              ? "bg-emerald-500/10 text-emerald-400"
              : "bg-cyan-500/10 text-cyan-400"
          }`}
        >
          {icon}
        </div>

      </div>

    </div>
  );
}

// =====================================================
// SMALL METRIC
// =====================================================

function SmallMetric({
  title,
  value,
  description,
  type = "default",
}: {
  title: string;
  value: number | string;
  description: string;
  type?: "default" | "warning" | "danger";
}) {
  const styles = {
    default:
      "border-slate-800 bg-slate-900",

    warning:
      "border-amber-500/20 bg-amber-500/5",

    danger:
      "border-red-500/20 bg-red-500/5",
  };

  const text = {
    default: "text-cyan-400",
    warning: "text-amber-400",
    danger: "text-red-400",
  };

  return (
    <div
      className={`rounded-2xl border p-5 ${styles[type]}`}
    >

      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        {title}
      </p>

      <p
        className={`mt-2 text-2xl font-black ${text[type]}`}
      >
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-600">
        {description}
      </p>

    </div>
  );
}

// =====================================================
// STATUS BADGE
// =====================================================

function StatusBadge({
  status,
}: {
  status: string;
}) {
  if (status === "paid") {
    return (
      <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-xs font-bold text-emerald-400">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        Paid
      </span>
    );
  }

  if (status === "created") {
    return (
      <span className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-2 text-xs font-bold text-amber-400">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
        Created
      </span>
    );
  }

  return (
    <span className="inline-flex w-fit items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-4 py-2 text-xs font-bold text-red-400">
      <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
      {status || "Unknown"}
    </span>
  );
}