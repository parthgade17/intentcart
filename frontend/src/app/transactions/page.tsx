"use client";

import { useEffect, useMemo, useState } from "react";
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
  orders: Order[];
  error?: string;
};

export default function TransactionsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadTransactions() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://localhost:5000/api/orders",
        {
          cache: "no-store",
        }
      );

      const data: OrdersResponse =
        await response.json();

      console.log("TRANSACTIONS API:", data);

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            "Failed to load transactions"
        );
      }

      setOrders(
        Array.isArray(data.orders)
          ? data.orders
          : []
      );
    } catch (err) {
      console.error(
        "Transactions error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load transactions"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTransactions();

    const interval = setInterval(
      loadTransactions,
      5000
    );

    return () => clearInterval(interval);
  }, []);

  const filteredOrders = useMemo(() => {
    if (filter === "all") {
      return orders;
    }

    return orders.filter(
      (order) =>
        order.status.toLowerCase() ===
        filter
    );
  }, [orders, filter]);

  const totalRevenue = orders
    .filter(
      (order) => order.status === "paid"
    )
    .reduce(
      (total, order) =>
        total + Number(order.amount),
      0
    );

  const paidCount = orders.filter(
    (order) => order.status === "paid"
  ).length;

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white md:p-10">

      <div className="mx-auto max-w-7xl">

        {/* HEADER */}

        <div className="mb-8">

          <Link
            href="/dashboard"
            className="mb-5 inline-block text-sm text-blue-400 hover:text-blue-300"
          >
            ← Back to Dashboard
          </Link>

          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">

            <div>

              <h1 className="text-3xl font-bold">
                Transaction History
              </h1>

              <p className="mt-2 text-slate-400">
                Live transactions from PostgreSQL
              </p>

            </div>

            <button
              onClick={loadTransactions}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold hover:bg-blue-500"
            >
              ↻ Refresh
            </button>

          </div>

        </div>

        {/* SUMMARY */}

        <div className="mb-6 grid gap-4 md:grid-cols-3">

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

            <p className="text-sm text-slate-400">
              Total Transactions
            </p>

            <p className="mt-2 text-2xl font-bold">
              {orders.length}
            </p>

          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

            <p className="text-sm text-slate-400">
              Successful Payments
            </p>

            <p className="mt-2 text-2xl font-bold text-emerald-400">
              {paidCount}
            </p>

          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

            <p className="text-sm text-slate-400">
              Total Revenue
            </p>

            <p className="mt-2 text-2xl font-bold">
              ₹
              {totalRevenue.toLocaleString(
                "en-IN",
                {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }
              )}
            </p>

          </div>

        </div>

        {/* FILTERS */}

        <div className="mb-6 flex flex-wrap gap-3">

          {[
            ["all", "All"],
            ["paid", "Paid"],
            ["created", "Created"],
            ["failed", "Failed"],
          ].map(([value, label]) => (

            <button
              key={value}
              onClick={() =>
                setFilter(value)
              }
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                filter === value
                  ? "bg-blue-600 text-white"
                  : "bg-slate-900 text-slate-400 hover:bg-slate-800"
              }`}
            >
              {label}
            </button>

          ))}

        </div>

        {/* CONTENT */}

        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">

          {/* LOADING */}

          {loading && (
            <div className="p-10 text-center text-slate-400">
              Loading transactions...
            </div>
          )}

          {/* ERROR */}

          {!loading && error && (
            <div className="p-10 text-center">

              <p className="font-semibold text-red-400">
                Failed to load transactions
              </p>

              <p className="mt-2 text-sm text-slate-500">
                {error}
              </p>

              <button
                onClick={loadTransactions}
                className="mt-5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold hover:bg-blue-500"
              >
                Try Again
              </button>

            </div>
          )}

          {/* EMPTY */}

          {!loading &&
            !error &&
            filteredOrders.length === 0 && (
              <div className="p-10 text-center text-slate-400">
                No transactions found.
              </div>
            )}

          {/* TRANSACTIONS */}

          {!loading &&
            !error &&
            filteredOrders.length > 0 && (

              <div className="divide-y divide-slate-800">

                {filteredOrders.map(
                  (order) => {

                    const date =
                      new Date(
                        order.created_at
                      );

                    return (
                      <Link
                        key={order.id}
                        href={`/order/${order.id}`}
                        className="block p-5 transition hover:bg-slate-800/50"
                      >

                        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                          {/* ORDER */}

                          <div className="flex items-start gap-4">

                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-800 font-bold">
                              #{order.id}
                            </div>

                            <div>

                              <p className="font-semibold">
                                Transaction #{order.id}
                              </p>

                              <p className="mt-1 break-all font-mono text-xs text-slate-500">
                                {order.razorpay_order_id}
                              </p>

                              <p className="mt-2 text-sm text-slate-500">
                                {date.toLocaleDateString(
                                  "en-IN"
                                )}{" "}
                                •{" "}
                                {date.toLocaleTimeString(
                                  "en-IN",
                                  {
                                    hour: "2-digit",
                                    minute:
                                      "2-digit",
                                  }
                                )}
                              </p>

                            </div>

                          </div>

                          {/* PAYMENT */}

                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-8">

                            <div className="sm:text-right">

                              <p className="text-lg font-bold">
                                ₹
                                {Number(
                                  order.amount
                                ).toLocaleString(
                                  "en-IN",
                                  {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  }
                                )}
                              </p>

                              <p className="text-xs text-slate-500">
                                {order.currency}
                              </p>

                            </div>

                            <span
                              className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                                order.status ===
                                "paid"
                                  ? "bg-emerald-500/10 text-emerald-400"
                                  : order.status ===
                                    "created"
                                  ? "bg-yellow-500/10 text-yellow-400"
                                  : "bg-red-500/10 text-red-400"
                              }`}
                            >
                              {order.status
                                .charAt(0)
                                .toUpperCase() +
                                order.status.slice(
                                  1
                                )}
                            </span>

                            <span className="text-slate-500">
                              →
                            </span>

                          </div>

                        </div>

                      </Link>
                    );
                  }
                )}

              </div>
            )}

        </div>

        {/* FOOTER */}

        <p className="mt-6 text-center text-xs text-slate-600">
          IntentCart • Live PostgreSQL Transaction Monitoring
        </p>

      </div>

    </main>
  );
}