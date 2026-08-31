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

type OrdersResponse = {
success: boolean;
orders?: Order[];
error?: string;
};

const BACKEND_URL =
process.env.NEXT_PUBLIC_API_URL ||
"https://intentcart-pixx.onrender.com";

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
      `${BACKEND_URL}/api/orders`,
      {
        cache: "no-store",
      }
    );

    const data: OrdersResponse =
      await response.json();

    console.log(
      "TRANSACTIONS API RESPONSE:",
      data
    );

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

const totalRevenue = useMemo(() => {
return orders
.filter(
(order) =>
order.status?.toLowerCase() ===
"paid"
)
.reduce(
(total, order) =>
total + Number(order.amount),
0
);
}, [orders]);

const paidCount = useMemo(() => {
return orders.filter(
(order) =>
order.status?.toLowerCase() ===
"paid"
).length;
}, [orders]);

const createdCount = useMemo(() => {
return orders.filter(
(order) =>
order.status?.toLowerCase() ===
"created"
).length;
}, [orders]);

const failedCount = useMemo(() => {
return orders.filter(
(order) =>
order.status?.toLowerCase() ===
"failed"
).length;
}, [orders]);

const formatCurrency = (value: number) => {
return `₹${value.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
};

const formatDate = (value: string) => {
const date = new Date(value);

return {
  date: date.toLocaleDateString(
    "en-IN"
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

if (loading) {
return ( <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white"> <div className="text-center"> <div className="mx-auto mb-5 h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-cyan-400" />

```
      <h1 className="text-xl font-semibold">
        Loading Transactions
      </h1>

      <p className="mt-2 text-sm text-slate-500">
        Fetching payment records from PostgreSQL...
      </p>
    </div>
  </main>
);

}

if (error) {
return ( <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white"> <div className="w-full max-w-lg rounded-2xl border border-red-500/20 bg-slate-900 p-8 text-center"> <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-2xl">
⚠️ </div>

      <h1 className="text-xl font-bold">
        Transactions Unavailable
      </h1>

      <p className="mt-2 text-sm text-slate-400">
        {error}
      </p>

      <button
        onClick={() =>
          loadTransactions()
        }
        className="mt-6 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
      >
        Try Again
      </button>

      <div className="mt-5">
        <Link
          href="/control-center/dashboard"
          className="text-sm text-cyan-400 hover:text-cyan-300"
        >
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  </main>
);

}

return ( <main className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-10"> <div className="mx-auto max-w-7xl">

```
    {/* HEADER */}

    <header className="mb-8">
      <Link
        href="/control-center/dashboard"
        className="mb-5 inline-block text-sm text-cyan-400 hover:text-cyan-300"
      >
        ← Back to Dashboard
      </Link>

      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
              ₹
            </span>

            <span className="text-sm font-medium text-cyan-400">
              IntentCart Admin
            </span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Transaction History
          </h1>

          <p className="mt-2 text-sm text-slate-400 sm:text-base">
            Monitor all Razorpay payments recorded in PostgreSQL.
          </p>
        </div>

        <button
          onClick={() =>
            loadTransactions(true)
          }
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-semibold transition hover:border-cyan-500/50 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span
            className={
              refreshing
                ? "animate-spin"
                : ""
            }
          >
            ↻
          </span>

          {refreshing
            ? "Refreshing..."
            : "Refresh Transactions"}
        </button>
      </div>
    </header>

    {/* LIVE STATUS */}

    <div className="mb-6 flex flex-col gap-2 rounded-xl border border-emerald-500/10 bg-emerald-500/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />

          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
        </span>

        <span className="text-xs font-medium text-emerald-300">
          Live transaction monitoring
        </span>
      </div>

      <span className="text-xs text-slate-500">
        Automatically updates every 10 seconds
      </span>
    </div>

    {/* SUMMARY */}

    <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

      <SummaryCard
        title="Total Transactions"
        value={orders.length.toString()}
        icon="↗"
      />

      <SummaryCard
        title="Successful Payments"
        value={paidCount.toString()}
        icon="✓"
        type="success"
      />

      <SummaryCard
        title="Pending Orders"
        value={createdCount.toString()}
        icon="◷"
        type="warning"
      />

      <SummaryCard
        title="Total Revenue"
        value={formatCurrency(
          totalRevenue
        )}
        icon="₹"
      />

    </section>

    {/* STATUS OVERVIEW */}

    <section className="mb-6 grid gap-4 sm:grid-cols-3">

      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-400">
          Paid
        </p>

        <p className="mt-2 text-3xl font-bold">
          {paidCount}
        </p>

        <p className="mt-1 text-xs text-slate-500">
          Successful transactions
        </p>
      </div>

      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-400">
          Created
        </p>

        <p className="mt-2 text-3xl font-bold">
          {createdCount}
        </p>

        <p className="mt-1 text-xs text-slate-500">
          Awaiting payment
        </p>
      </div>

      <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-red-400">
          Failed
        </p>

        <p className="mt-2 text-3xl font-bold">
          {failedCount}
        </p>

        <p className="mt-1 text-xs text-slate-500">
          Unsuccessful transactions
        </p>
      </div>

    </section>

    {/* FILTERS */}

    <section className="mb-6 rounded-2xl border border-slate-800 bg-slate-900 p-4">

      <div className="mb-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
          Filter Transactions
        </p>
      </div>

      <div className="flex flex-wrap gap-3">

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
                ? "bg-cyan-500 text-slate-950"
                : "bg-slate-950 text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            {label}
          </button>
        ))}

      </div>
    </section>

    {/* TRANSACTIONS */}

    <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">

      <div className="border-b border-slate-800 px-6 py-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400">
          PostgreSQL Records
        </p>

        <h2 className="mt-1 text-xl font-bold">
          Transactions
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Click any transaction to view complete order details.
        </p>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="px-6 py-16 text-center">

          <div className="text-4xl">
            📭
          </div>

          <h3 className="mt-4 text-lg font-semibold">
            No transactions found
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            There are no transactions matching the selected filter.
          </p>

        </div>
      ) : (
        <div className="divide-y divide-slate-800">

          {filteredOrders.map(
            (order) => {
              const date =
                formatDate(
                  order.created_at
                );

              const normalizedStatus =
                order.status?.toLowerCase();

              return (
                <Link
                  key={order.id}
                  href={`/order/${order.id}`}
                  className="block transition hover:bg-slate-800/50"
                >

                  <div className="p-5 sm:p-6">

                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                      {/* ORDER INFORMATION */}

                      <div className="flex min-w-0 items-start gap-4">

                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-800 font-bold text-cyan-400">
                          #{order.id}
                        </div>

                        <div className="min-w-0">

                          <p className="font-semibold">
                            Transaction #{order.id}
                          </p>

                          <p className="mt-1 truncate font-mono text-xs text-slate-500 sm:max-w-[400px]">
                            {order.razorpay_order_id}
                          </p>

                          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
                            <span>
                              {date.date}
                            </span>

                            <span>
                              •
                            </span>

                            <span>
                              {date.time}
                            </span>
                          </div>

                        </div>

                      </div>

                      {/* PAYMENT INFORMATION */}

                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">

                        <div className="sm:text-right">

                          <p className="text-lg font-bold">
                            {formatCurrency(
                              Number(
                                order.amount
                              )
                            )}
                          </p>

                          <p className="text-xs text-slate-500">
                            {order.currency}
                          </p>

                        </div>

                        <div>

                          {normalizedStatus ===
                          "paid" ? (
                            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                              Paid
                            </span>
                          ) : normalizedStatus ===
                            "created" ? (
                            <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-400">
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                              Created
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-400">
                              <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                              {order.status}
                            </span>
                          )}

                        </div>

                        <div className="hidden text-xl text-slate-600 sm:block">
                          →
                        </div>

                      </div>

                    </div>

                    {/* PAYMENT ID */}

                    <div className="mt-5 border-t border-slate-800 pt-4">

                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">

                        <span className="text-xs text-slate-500">
                          Razorpay Payment ID
                        </span>

                        <span className="break-all font-mono text-xs text-slate-400 sm:text-right">
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

    <footer className="mt-8 border-t border-slate-800 pt-6 text-center text-xs text-slate-600">
      IntentCart Admin • PostgreSQL + Razorpay Transaction Monitoring
    </footer>

  </div>
</main>

);
}

/* ==========================================================
SUMMARY CARD
========================================================== */

function SummaryCard({
title,
value,
icon,
type = "default",
}: {
title: string;
value: string;
icon: string;
type?: "default" | "success" | "warning";
}) {
const styles = {
default:
"border-slate-800 bg-slate-900",
success:
"border-emerald-500/20 bg-emerald-500/5",
warning:
"border-amber-500/20 bg-amber-500/5",
};

const iconStyles = {
default:
"bg-cyan-500/10 text-cyan-400",
success:
"bg-emerald-500/10 text-emerald-400",
warning:
"bg-amber-500/10 text-amber-400",
};

return (
<div
className={`rounded-xl border p-5 ${styles[type]}`}
> <div className="flex items-start justify-between">

    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {title}
      </p>

      <p className="mt-3 text-2xl font-bold">
        {value}
      </p>
    </div>

    <div
      className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconStyles[type]}`}
    >
      {icon}
    </div>

  </div>
</div>

);
}
