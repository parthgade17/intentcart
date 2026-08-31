
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";

export default function OrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadOrder() {
      try {
        const { id } = await params;

        if (!id || !/^\d+$/.test(id)) {
          throw new Error("Invalid order ID");
        }

        console.log("ORDER ID:", id);

        const response = await fetch(
          `${BACKEND_URL}/api/orders/${id}`,
          {
            cache: "no-store",
          }
        );

        const data: OrderResponse =
          await response.json();

        console.log("FULL API RESPONSE:", data);
        console.log("ITEMS:", data.items);

        if (!response.ok || !data.success || !data.order) {
          throw new Error(
            data.error || "Failed to load order"
          );
        }

        setOrder(data.order);

        if (Array.isArray(data.items)) {
          setItems(data.items);
        } else {
          setItems([]);
        }
      } catch (err) {
        console.error("ORDER ERROR:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load order"
        );
      } finally {
        setLoading(false);
      }
    }

    loadOrder();
  }, [params]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
        <div className="text-center">
          <div className="mx-auto mb-5 h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-cyan-400" />

          <h2 className="text-xl font-semibold">
            Loading Order Details
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Retrieving transaction information...
          </p>
        </div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="min-h-screen bg-slate-950 p-6 text-white md:p-10">
        <div className="mx-auto max-w-5xl">
          <Link
            href="/control-center/dashboard"
            className="mb-6 inline-flex items-center text-sm text-cyan-400 transition hover:text-cyan-300"
          >
            ← Back to Admin Dashboard
          </Link>

          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6">
            <h1 className="text-xl font-bold text-red-400">
              Unable to load order
            </h1>

            <p className="mt-2 text-slate-300">
              {error || "Order not found"}
            </p>

            <Link
              href="/control-center/transactions"
              className="mt-5 inline-flex rounded-xl bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500/20"
            >
              View Transactions
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const amount = Number(order.amount);
  const orderDate = new Date(order.created_at);

  const normalizedStatus =
    order.status?.toLowerCase();

  const statusClass =
    normalizedStatus === "paid"
      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
      : normalizedStatus === "created"
      ? "border-yellow-500/20 bg-yellow-500/10 text-yellow-400"
      : "border-red-500/20 bg-red-500/10 text-red-400";

  const statusLabel =
    order.status?.toUpperCase() || "UNKNOWN";

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white md:p-10">
      <div className="mx-auto max-w-5xl">

        {/* HEADER */}

        <div className="mb-8">
          <div className="mb-5 flex flex-wrap gap-4">
            <Link
              href="/control-center/dashboard"
              className="text-sm text-cyan-400 transition hover:text-cyan-300"
            >
              ← Admin Dashboard
            </Link>

            <Link
              href="/control-center/transactions"
              className="text-sm text-slate-400 transition hover:text-white"
            >
              Transactions →
            </Link>
          </div>

          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400">
                Transaction Details
              </p>

              <h1 className="mt-2 text-3xl font-bold">
                Order #{order.id}
              </h1>

              <p className="mt-1 text-slate-400">
                Complete payment and order information
              </p>
            </div>

            <div
              className={`w-fit rounded-full border px-4 py-2 text-sm font-semibold ${statusClass}`}
            >
              {statusLabel}
            </div>
          </div>
        </div>

        {/* SUMMARY */}

        <section className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">
              Payment Status
            </p>

            <p
              className={`mt-2 text-2xl font-bold ${
                normalizedStatus === "paid"
                  ? "text-emerald-400"
                  : normalizedStatus === "created"
                  ? "text-yellow-400"
                  : "text-red-400"
              }`}
            >
              {order.status}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">
              Total Amount
            </p>

            <p className="mt-2 text-2xl font-bold">
              ₹
              {amount.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              {order.currency}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">
              Products
            </p>

            <p className="mt-2 text-2xl font-bold">
              {items.length}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Items in this order
            </p>
          </div>
        </section>

        {/* TRANSACTION INFORMATION */}

        <section className="mb-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="mb-6 text-xl font-bold">
            Transaction Information
          </h2>

          <div className="grid gap-6 md:grid-cols-2">

            <div>
              <p className="text-sm text-slate-400">
                Internal Order ID
              </p>

              <p className="mt-1 font-semibold">
                #{order.id}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-400">
                Order Status
              </p>

              <p className="mt-1 font-semibold">
                {order.status}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-400">
                Razorpay Order ID
              </p>

              <p className="mt-1 break-all font-mono text-sm text-slate-200">
                {order.razorpay_order_id}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-400">
                Razorpay Payment ID
              </p>

              <p className="mt-1 break-all font-mono text-sm text-slate-200">
                {order.razorpay_payment_id ||
                  "Not available"}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-400">
                Currency
              </p>

              <p className="mt-1 font-semibold">
                {order.currency}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-400">
                Amount
              </p>

              <p className="mt-1 font-semibold">
                ₹
                {amount.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-400">
                Order Date
              </p>

              <p className="mt-1 font-semibold">
                {orderDate.toLocaleDateString("en-IN")}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-400">
                Order Time
              </p>

              <p className="mt-1 font-semibold">
                {orderDate.toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>

          </div>
        </section>

        {/* ORDER CONTENTS */}

        <section className="mb-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-purple-400">
              Order Contents
            </p>

            <h2 className="mt-1 text-2xl font-bold">
              Products Purchased
            </h2>
          </div>

          {items.length > 0 ? (
            <div className="space-y-4">
              {items.map((item) => {
                const price = Number(item.price);
                const quantity = Number(item.quantity);
                const total = price * quantity;

                return (
                  <div
                    key={item.id}
                    className="flex flex-col gap-4 rounded-xl border border-slate-800 bg-slate-950 p-5 md:flex-row md:items-center md:justify-between"
                  >
                    {/* PRODUCT */}

                    <div className="flex items-center gap-4">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-3xl">
                        {item.emoji || "📦"}
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold">
                          {item.name}
                        </h3>

                        {item.category && (
                          <p className="mt-1 text-sm text-slate-400">
                            {item.category}
                          </p>
                        )}

                        <p className="mt-1 text-sm text-slate-500">
                          Product ID: {item.product_id}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          Quantity: {quantity}
                        </p>
                      </div>
                    </div>

                    {/* PRICE */}

                    <div className="text-left md:text-right">
                      <p className="text-xl font-bold">
                        ₹
                        {price.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>

                      <p className="text-sm text-slate-500">
                        ₹
                        {total.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}{" "}
                        total
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-6">
              <p className="font-semibold text-yellow-400">
                No product details available
              </p>

              <p className="mt-2 text-sm text-slate-400">
                Product information was not stored for this
                order.
              </p>
            </div>
          )}
        </section>

        {/* TOTAL */}

        <section className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-slate-400">
                Order Total
              </p>

              <p className="mt-1 text-slate-300">
                Final amount recorded in PostgreSQL
              </p>
            </div>

            <p className="text-2xl font-bold">
              ₹
              {amount.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
        </section>

        {/* FOOTER */}

        <footer className="mt-8 border-t border-slate-800 pt-6 text-center text-xs text-slate-600">
          IntentCart Admin • PostgreSQL + Razorpay
        </footer>

      </div>
    </main>
  );
}
