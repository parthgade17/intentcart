
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

type OrderItem = {
  id: number;
  order_id?: number;
  product_id: number;
  name: string;
  category: string | null;
  price: string | number;
  quantity: number;
  emoji: string | null;
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

type OrderResponse = {
  success: boolean;
  order?: Order;
  items?: OrderItem[];
  error?: string;
};

export default function OrderDetailsPage() {
  const params = useParams();

  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadOrder() {
      try {
        const id = Array.isArray(params.id)
          ? params.id[0]
          : params.id;

        if (!id) {
          throw new Error("Order ID is missing.");
        }

        // IMPORTANT:
        // Use the protected Next.js admin API.
        // Do NOT call the Render backend directly from this page.
        const response = await fetch(
          `/api/admin/orders/${encodeURIComponent(id)}`,
          {
            cache: "no-store",
          }
        );

        const data: OrderResponse =
          await response.json();

        console.log("ADMIN ORDER DETAILS:", data);

        if (!response.ok || !data.success) {
          if (response.status === 401) {
            window.location.href = "/admin";
            return;
          }

          throw new Error(
            data.error || "Unable to load order."
          );
        }

        if (!data.order) {
          throw new Error("Order was not found.");
        }

        setOrder(data.order);

        setItems(
          Array.isArray(data.items)
            ? data.items
            : []
        );
      } catch (err) {
        console.error(
          "ORDER DETAILS ERROR:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load order."
        );
      } finally {
        setLoading(false);
      }
    }

    loadOrder();
  }, [params.id]);

  // =====================================================
  // CALCULATIONS
  // =====================================================

  const amount = useMemo(() => {
    return Number(order?.amount || 0);
  }, [order]);

  const itemCount = useMemo(() => {
    return items.reduce(
      (total, item) =>
        total + Number(item.quantity || 0),
      0
    );
  }, [items]);

  const formattedDate = useMemo(() => {
    if (!order?.created_at) {
      return {
        date: "—",
        time: "—",
      };
    }

    const date = new Date(order.created_at);

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
  }, [order]);

  const status =
    order?.status?.toLowerCase() || "unknown";

  const isPaid = status === "paid";
  const isCreated = status === "created";
  const isFailed = status === "failed";

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-800 border-t-cyan-400" />

          <h1 className="mt-6 text-xl font-bold">
            Loading Order
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Fetching order details...
          </p>
        </div>
      </main>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error || !order) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
        <div className="w-full max-w-lg rounded-3xl border border-red-500/20 bg-slate-900 p-8 text-center">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-3xl">
            ⚠️
          </div>

          <h1 className="mt-6 text-2xl font-black">
            Order Not Found
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-400">
            {error ||
              "We could not find this order."}
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">

            <Link
              href="/control-center/transactions"
              className="rounded-xl bg-cyan-400 px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300"
            >
              Transactions
            </Link>

            <Link
              href="/control-center/dashboard"
              className="rounded-xl border border-slate-700 px-6 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-800"
            >
              Dashboard
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
          ADMIN NAVBAR
      ================================================= */}

      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur-xl">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">

          <Link
            href="/control-center/dashboard"
            className="flex items-center gap-3"
          >

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400 text-xl font-black text-slate-950">
              I
            </div>

            <div>
              <p className="text-lg font-black">
                Intent<span className="text-cyan-400">
                  Cart
                </span>
              </p>

              <p className="text-[9px] uppercase tracking-[0.3em] text-slate-600">
                Admin Control Center
              </p>
            </div>

          </Link>

          <div className="flex gap-3">

            <Link
              href="/control-center/transactions"
              className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-cyan-500/30 hover:text-white"
            >
              Transactions
            </Link>

            <Link
              href="/control-center/dashboard"
              className="hidden rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-cyan-400 transition hover:border-cyan-500/30 sm:block"
            >
              Dashboard
            </Link>

          </div>

        </div>

      </header>

      {/* =================================================
          MAIN
      ================================================= */}

      <div className="mx-auto max-w-7xl px-5 py-8 md:py-12">

        {/* Breadcrumb */}

        <div className="mb-8 flex flex-wrap items-center gap-2 text-sm">

          <Link
            href="/control-center/dashboard"
            className="text-slate-500 hover:text-cyan-400"
          >
            Dashboard
          </Link>

          <span className="text-slate-700">
            /
          </span>

          <Link
            href="/control-center/transactions"
            className="text-slate-500 hover:text-cyan-400"
          >
            Transactions
          </Link>

          <span className="text-slate-700">
            /
          </span>

          <span className="text-slate-400">
            Order #{order.id}
          </span>

        </div>

        {/* =================================================
            HERO
        ================================================= */}

        <section className="relative mb-8 overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 p-7 md:p-10">

          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-cyan-500/5 blur-3xl" />

          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

            <div className="flex items-start gap-5">

              <div
                className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-3xl ${
                  isPaid
                    ? "bg-emerald-500/10 text-emerald-400"
                    : isCreated
                    ? "bg-amber-500/10 text-amber-400"
                    : "bg-red-500/10 text-red-400"
                }`}
              >
                {isPaid
                  ? "✓"
                  : isCreated
                  ? "◷"
                  : "!"}
              </div>

              <div>

                <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
                  Admin Order Details
                </p>

                <h1 className="mt-2 text-3xl font-black md:text-4xl">
                  Order #{order.id}
                </h1>

                <p className="mt-2 text-sm text-slate-400">
                  Created on{" "}
                  {formattedDate.date}{" "}
                  at{" "}
                  {formattedDate.time}
                </p>

              </div>

            </div>

            <StatusBadge
              status={order.status}
            />

          </div>

        </section>

        {/* =================================================
            SUMMARY CARDS
        ================================================= */}

        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <InfoCard
            label="Total Amount"
            value={`₹${amount.toLocaleString(
              "en-IN",
              {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }
            )}`}
            icon="₹"
          />

          <InfoCard
            label="Items"
            value={itemCount.toString()}
            icon="📦"
          />

          <InfoCard
            label="Currency"
            value={order.currency}
            icon="💰"
          />

          <InfoCard
            label="Payment"
            value={
              isPaid
                ? "Successful"
                : order.status
            }
            icon={
              isPaid
                ? "✓"
                : isCreated
                ? "◷"
                : "!"
            }
          />

        </section>

        {/* =================================================
            CONTENT
        ================================================= */}

        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">

          {/* =================================================
              LEFT
          ================================================= */}

          <div className="space-y-8">

            {/* ORDER ITEMS */}

            <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 md:p-8">

              <div className="mb-7">

                <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
                  Purchase
                </p>

                <h2 className="mt-1 text-2xl font-black">
                  Order Items
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Products stored with this transaction.
                </p>

              </div>

              {items.length > 0 ? (

                <div className="space-y-3">

                  {items.map((item) => {

                    const price =
                      Number(item.price);

                    const quantity =
                      Number(item.quantity);

                    const total =
                      price * quantity;

                    return (
                      <div
                        key={item.id}
                        className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-950 p-4 sm:flex-row sm:items-center sm:justify-between"
                      >

                        <div className="flex items-center gap-4">

                          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 text-3xl">
                            {item.emoji ||
                              "📦"}
                          </div>

                          <div>

                            <h3 className="font-bold">
                              {item.name}
                            </h3>

                            <p className="mt-1 text-xs text-slate-500">
                              {item.category ||
                                "Product"}
                            </p>

                            <p className="mt-2 text-sm text-slate-400">
                              ₹
                              {price.toLocaleString(
                                "en-IN"
                              )}{" "}
                              ×{" "}
                              {quantity}
                            </p>

                          </div>

                        </div>

                        <div className="sm:text-right">

                          <p className="text-lg font-black">
                            ₹
                            {total.toLocaleString(
                              "en-IN",
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }
                            )}
                          </p>

                          <p className="mt-1 text-xs text-slate-600">
                            Product #
                            {item.product_id}
                          </p>

                        </div>

                      </div>
                    );
                  })}

                </div>

              ) : (

                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">

                  <p className="font-semibold text-amber-400">
                    No product details available
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    This order does not contain stored item information.
                  </p>

                </div>

              )}

            </section>

            {/* PAYMENT DETAILS */}

            <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 md:p-8">

              <div className="mb-7">

                <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
                  Razorpay
                </p>

                <h2 className="mt-1 text-2xl font-black">
                  Payment Details
                </h2>

              </div>

              <div className="space-y-5">

                <DetailRow
                  label="Razorpay Order ID"
                  value={
                    order.razorpay_order_id
                  }
                />

                <DetailRow
                  label="Razorpay Payment ID"
                  value={
                    order.razorpay_payment_id ||
                    "Not available"
                  }
                />

                <div className="grid gap-5 sm:grid-cols-2">

                  <DetailRow
                    label="Currency"
                    value={
                      order.currency
                    }
                  />

                  <DetailRow
                    label="Payment Status"
                    value={
                      order.status
                    }
                    highlight={isPaid}
                    danger={isFailed}
                  />

                </div>

              </div>

            </section>

          </div>

          {/* =================================================
              RIGHT
          ================================================= */}

          <aside className="lg:sticky lg:top-24 lg:h-fit">

            <section className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900">

              <div className="border-b border-slate-800 p-6">

                <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
                  Summary
                </p>

                <h2 className="mt-1 text-xl font-black">
                  Payment Summary
                </h2>

              </div>

              <div className="space-y-5 p-6">

                <SummaryRow
                  label="Order ID"
                  value={`#${order.id}`}
                />

                <SummaryRow
                  label="Items"
                  value={itemCount.toString()}
                />

                <SummaryRow
                  label="Currency"
                  value={order.currency}
                />

                <SummaryRow
                  label="Status"
                  value={order.status}
                  highlight={isPaid}
                  warning={isCreated}
                  danger={isFailed}
                />

                <div className="border-t border-slate-800 pt-5">

                  <div className="flex items-end justify-between">

                    <div>
                      <p className="text-sm text-slate-500">
                        Total
                      </p>

                      <p className="mt-1 text-xs text-slate-600">
                        Final recorded amount
                      </p>
                    </div>

                    <p className="text-2xl font-black text-cyan-400">
                      ₹
                      {amount.toLocaleString(
                        "en-IN",
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )}
                    </p>

                  </div>

                </div>

              </div>

              <div className="border-t border-slate-800 p-6">

                <Link
                  href="/control-center/transactions"
                  className="flex w-full items-center justify-center rounded-xl bg-cyan-400 px-5 py-3 font-bold text-slate-950 transition hover:bg-cyan-300"
                >
                  ← Back to Transactions
                </Link>

              </div>

            </section>

          </aside>

        </div>

        {/* FOOTER */}

        <footer className="mt-12 border-t border-slate-900 pt-8 text-center">

          <p className="text-sm font-bold text-slate-600">
            Intent<span className="text-cyan-500">
              Cart
            </span>
          </p>

          <p className="mt-1 text-xs text-slate-700">
            Admin Control Center • PostgreSQL + Razorpay
          </p>

        </footer>

      </div>
    </main>
  );
}

// =====================================================
// INFO CARD
// =====================================================

function InfoCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

      <div className="flex items-start justify-between">

        <div>

          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {label}
          </p>

          <p className="mt-3 text-xl font-black">
            {value}
          </p>

        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
          {icon}
        </div>

      </div>

    </div>
  );
}

// =====================================================
// DETAIL ROW
// =====================================================

function DetailRow({
  label,
  value,
  highlight = false,
  danger = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  danger?: boolean;
}) {
  return (
    <div>

      <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">
        {label}
      </p>

      <p
        className={`mt-2 break-all rounded-xl bg-slate-950 p-3 font-mono text-xs ${
          highlight
            ? "text-emerald-400"
            : danger
            ? "text-red-400"
            : "text-slate-400"
        }`}
      >
        {value}
      </p>

    </div>
  );
}

// =====================================================
// SUMMARY ROW
// =====================================================

function SummaryRow({
  label,
  value,
  highlight = false,
  warning = false,
  danger = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  warning?: boolean;
  danger?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">

      <span className="text-slate-500">
        {label}
      </span>

      <span
        className={
          highlight
            ? "font-bold text-emerald-400"
            : warning
            ? "font-bold text-amber-400"
            : danger
            ? "font-bold text-red-400"
            : "font-semibold text-slate-300"
        }
      >
        {value}
      </span>

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
  const normalized =
    status?.toLowerCase();

  if (normalized === "paid") {
    return (
      <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-5 py-2 text-sm font-bold text-emerald-400">
        <span className="h-2 w-2 rounded-full bg-emerald-400" />
        Paid
      </span>
    );
  }

  if (normalized === "created") {
    return (
      <span className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-5 py-2 text-sm font-bold text-amber-400">
        <span className="h-2 w-2 rounded-full bg-amber-400" />
        Created
      </span>
    );
  }

  return (
    <span className="inline-flex w-fit items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-5 py-2 text-sm font-bold text-red-400">
      <span className="h-2 w-2 rounded-full bg-red-400" />
      {status || "Unknown"}
    </span>
  );
}
