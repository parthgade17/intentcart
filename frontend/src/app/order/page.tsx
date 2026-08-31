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

export default function OrderPage() {
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchOrder() {
      try {
        const orderId = window.location.pathname.split("/").pop();

        if (!orderId) {
          throw new Error("Order ID not found");
        }

        const response = await fetch(
         `https://intentcart-pixx.onrender.com/api/orders/${orderId}`,
          {
            cache: "no-store",
          }
        );

        const data = await response.json();

        console.log("FULL ORDER DATA:", data);

        if (!response.ok || !data.success) {
          throw new Error(
            data.error || "Failed to load order"
          );
        }

        setOrder(data.order);

        /*
          Your backend currently returns:

          {
            success: true,
            order: {...},
            items: [...]
          }

          This also supports order.items just in case.
        */

        const productItems =
          Array.isArray(data.items)
            ? data.items
            : Array.isArray(data.order?.items)
            ? data.order.items
            : [];

        console.log("PRODUCT ITEMS:", productItems);

        setItems(productItems);
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

    fetchOrder();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 p-10 text-white">
        <div className="mx-auto max-w-5xl">
          <p className="text-slate-400">
            Loading order details...
          </p>
        </div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="min-h-screen bg-slate-950 p-10 text-white">
        <div className="mx-auto max-w-5xl">

          <Link
            href="/dashboard"
            className="mb-6 inline-block text-blue-400 hover:text-blue-300"
          >
            ← Back to Dashboard
          </Link>

          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6">
            <h1 className="text-xl font-bold text-red-400">
              Unable to load order
            </h1>

            <p className="mt-2 text-slate-300">
              {error || "Order not found"}
            </p>
          </div>

        </div>
      </main>
    );
  }

  const amount = Number(order.amount);
  const date = new Date(order.created_at);

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white md:p-10">

      <div className="mx-auto max-w-5xl">

        {/* HEADER */}

        <div className="mb-8">

          <Link
            href="/dashboard"
            className="mb-5 inline-block text-sm text-blue-400 hover:text-blue-300"
          >
            ← Back to Dashboard
          </Link>

          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

            <div>

              <h1 className="text-3xl font-bold">
                Order #{order.id}
              </h1>

              <p className="mt-1 text-slate-400">
                Complete transaction details
              </p>

            </div>

            <div
              className={`w-fit rounded-full px-4 py-2 text-sm font-semibold ${
                order.status === "paid"
                  ? "bg-emerald-500/10 text-emerald-400"
                  : order.status === "created"
                  ? "bg-yellow-500/10 text-yellow-400"
                  : "bg-red-500/10 text-red-400"
              }`}
            >
              {order.status.toUpperCase()}
            </div>

          </div>

        </div>

        {/* SUMMARY */}

        <div className="mb-6 grid gap-4 md:grid-cols-2">

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <p className="text-sm text-slate-400">
              Payment Status
            </p>

            <p className="mt-2 text-2xl font-bold text-emerald-400">
              {order.status === "paid"
                ? "Paid"
                : order.status}
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

        </div>

        {/* TRANSACTION INFORMATION */}

        <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">

          <h2 className="mb-6 text-xl font-bold">
            Transaction Information
          </h2>

          <div className="grid gap-6 md:grid-cols-2">

            <div>
              <p className="text-sm text-slate-400">
                Order ID
              </p>
              <p className="mt-1 font-semibold">
                #{order.id}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-400">
                Razorpay Order ID
              </p>
              <p className="mt-1 break-all font-mono text-sm">
                {order.razorpay_order_id}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-400">
                Razorpay Payment ID
              </p>
              <p className="mt-1 break-all font-mono text-sm">
                {order.razorpay_payment_id ||
                  "Not available"}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-400">
                Status
              </p>
              <p className="mt-1 font-semibold">
                {order.status}
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
                Order Date
              </p>
              <p className="mt-1 font-semibold">
                {date.toLocaleDateString("en-IN")}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-400">
                Order Time
              </p>
              <p className="mt-1 font-semibold">
                {date.toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>

          </div>

        </div>

        {/* PRODUCTS */}

        <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">

          <p className="text-sm text-slate-400">
            Order Contents
          </p>

          <h2 className="mt-1 mb-6 text-2xl font-bold">
            Products Purchased
          </h2>

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

                      <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-slate-800 text-3xl">
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

                      {quantity > 1 && (
                        <p className="text-sm text-slate-500">
                          ₹
                          {total.toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}{" "}
                          total
                        </p>
                      )}

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
                Product information was not stored for
                this order.
              </p>

            </div>

          )}

        </div>

        {/* TOTAL */}

        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-6">

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

        </div>

        {/* FOOTER */}

        <div className="mt-8 text-center text-sm text-slate-600">
          IntentCart • PostgreSQL Order Intelligence
        </div>

      </div>

    </main>
  );
}