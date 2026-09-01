
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type PaymentItem = {
  id?: number;
  product_id?: number;
  name?: string;
  category?: string;
  price?: number | string;
  quantity?: number | string;
  emoji?: string;
};

type PaymentData = {
  databaseOrderId?: number;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  amount?: number | string;
  currency?: string;
  status?: string;
  items?: PaymentItem[];
  paidAt?: string;
};

export default function PaymentSuccessPage() {
  const [payment, setPayment] =
    useState<PaymentData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [showPaymentDetails, setShowPaymentDetails] =
    useState(false);

  useEffect(() => {
    try {
      const savedPayment =
        localStorage.getItem(
          "intentcart_last_payment"
        );

      if (savedPayment) {
        const parsed: PaymentData =
          JSON.parse(savedPayment);

        console.log(
          "PAYMENT SUCCESS DATA:",
          parsed
        );

        setPayment(parsed);
      }
    } catch (error) {
      console.error(
        "Failed to load payment:",
        error
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const orderId =
    payment?.databaseOrderId;

  const amount =
    Number(payment?.amount || 0);

  const itemCount = useMemo(() => {
    return (
      payment?.items?.reduce(
        (total, item) =>
          total +
          Number(item.quantity || 0),
        0
      ) || 0
    );
  }, [payment]);

  const paidDate = payment?.paidAt
    ? new Date(payment.paidAt)
    : null;

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center">

          <div className="mx-auto flex h-16 w-16 animate-pulse items-center justify-center rounded-2xl bg-cyan-500/10 text-3xl">
            ✦
          </div>

          <p className="mt-5 text-sm text-slate-500">
            Preparing your order confirmation...
          </p>

        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <nav className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-xl">

        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">

          <Link
            href="/products"
            className="group flex items-center gap-3"
          >

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500 text-lg font-black text-slate-950 shadow-lg shadow-cyan-500/20 transition group-hover:scale-105">
              I
            </div>

            <div>

              <h1 className="text-lg font-bold tracking-tight">
                IntentCart
              </h1>

              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                Smart Commerce
              </p>

            </div>

          </Link>

          <Link
            href="/products"
            className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-semibold transition hover:border-cyan-500/40 hover:bg-slate-800"
          >
            🛍️ Shop
          </Link>

        </div>

      </nav>

      {/* =====================================================
          SUCCESS HERO
      ===================================================== */}

      <section className="relative overflow-hidden">

        {/* Background effects */}

        <div className="pointer-events-none absolute inset-0">

          <div className="absolute left-1/2 top-0 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[100px]" />

          <div className="absolute left-0 top-72 h-72 w-72 rounded-full bg-cyan-500/5 blur-[100px]" />

          <div className="absolute right-0 top-96 h-72 w-72 rounded-full bg-blue-500/5 blur-[100px]" />

        </div>

        <div className="relative mx-auto max-w-5xl px-5 pb-16 pt-14 sm:pt-20">

          {/* SUCCESS ICON */}

          <div className="text-center">

            <div className="relative mx-auto h-28 w-28">

              <div className="absolute inset-0 animate-pulse rounded-full bg-emerald-500/10" />

              <div className="relative flex h-28 w-28 items-center justify-center rounded-full border border-emerald-400/20 bg-emerald-500/10">

                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500 shadow-xl shadow-emerald-500/20">

                  <span className="text-4xl font-black text-slate-950">
                    ✓
                  </span>

                </div>

              </div>

            </div>

            {/* TITLE */}

            <p className="mt-8 text-xs font-bold uppercase tracking-[0.3em] text-emerald-400">
              Order Confirmed
            </p>

            <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-6xl">
              Thank you for your order!
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
              Your payment was successful and your order
              has been securely confirmed. We've saved
              everything safely in your IntentCart account.
            </p>

          </div>

          {/* =================================================
              ORDER HERO CARD
          ================================================= */}

          <div className="mt-12 overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl">

            <div className="border-b border-slate-800 bg-slate-900/80 p-6 sm:p-8">

              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                <div>

                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                    Your Order
                  </p>

                  <h2 className="mt-1 text-3xl font-black">
                    #{orderId || "Confirmed"}
                  </h2>

                </div>

                <div className="flex items-center gap-3">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-xl">
                    ✓
                  </div>

                  <div>

                    <p className="text-sm font-bold text-emerald-400">
                      Payment Complete
                    </p>

                    <p className="text-xs text-slate-500">
                      {itemCount} item
                      {itemCount !== 1
                        ? "s"
                        : ""}{" "}
                      purchased
                    </p>

                  </div>

                </div>

              </div>

            </div>

            {/* ORDER SUMMARY */}

            <div className="grid divide-y divide-slate-800 sm:grid-cols-3 sm:divide-x sm:divide-y-0">

              <div className="p-6">

                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Total Paid
                </p>

                <p className="mt-2 text-3xl font-black">
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

              <div className="p-6">

                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Payment
                </p>

                <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-400">

                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                  {payment?.status ||
                    "Paid"}

                </p>

              </div>

              <div className="p-6">

                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Order Date
                </p>

                {paidDate ? (
                  <>
                    <p className="mt-2 text-sm font-bold">
                      {paidDate.toLocaleDateString(
                        "en-IN",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        }
                      )}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {paidDate.toLocaleTimeString(
                        "en-IN",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </p>
                  </>
                ) : (
                  <p className="mt-2 text-sm text-slate-500">
                    Recently
                  </p>
                )}

              </div>

            </div>

          </div>

          {/* =================================================
              ORDER PROGRESS
          ================================================= */}

          <div className="mt-6 rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-8">

            <div className="mb-7">

              <p className="text-xs font-bold uppercase tracking-widest text-cyan-400">
                What's next?
              </p>

              <h2 className="mt-1 text-xl font-bold">
                Your order is on its way
              </h2>

            </div>

            <div className="grid gap-6 sm:grid-cols-3">

              {/* STEP 1 */}

              <div className="relative">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-sm font-black text-slate-950">
                    ✓
                  </div>

                  <div>

                    <p className="text-sm font-bold">
                      Order Confirmed
                    </p>

                    <p className="text-xs text-emerald-400">
                      Completed
                    </p>

                  </div>

                </div>

              </div>

              {/* STEP 2 */}

              <div>

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-cyan-500/30 bg-cyan-500/10 text-lg">
                    📦
                  </div>

                  <div>

                    <p className="text-sm font-bold">
                      Preparing Order
                    </p>

                    <p className="text-xs text-slate-500">
                      Coming next
                    </p>

                  </div>

                </div>

              </div>

              {/* STEP 3 */}

              <div>

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-700 bg-slate-950 text-lg">
                    🚚
                  </div>

                  <div>

                    <p className="text-sm font-bold">
                      Delivery
                    </p>

                    <p className="text-xs text-slate-500">
                      Coming soon
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </div>

          {/* =================================================
              PRODUCTS
          ================================================= */}

          {payment?.items &&
            payment.items.length > 0 && (

              <div className="mt-6 rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-8">

                <div className="mb-7 flex items-end justify-between gap-4">

                  <div>

                    <p className="text-xs font-bold uppercase tracking-widest text-cyan-400">
                      Your Purchase
                    </p>

                    <h2 className="mt-1 text-xl font-bold">
                      Order Items
                    </h2>

                  </div>

                  <span className="hidden rounded-lg bg-slate-800 px-3 py-1.5 text-xs text-slate-400 sm:block">
                    {itemCount} item
                    {itemCount !== 1
                      ? "s"
                      : ""}
                  </span>

                </div>

                <div className="space-y-3">

                  {payment.items.map(
                    (item, index) => {

                      const price =
                        Number(
                          item.price || 0
                        );

                      const quantity =
                        Number(
                          item.quantity || 0
                        );

                      const total =
                        price * quantity;

                      return (
                        <div
                          key={
                            item.id ??
                            `${item.product_id}-${index}`
                          }
                          className="group flex items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-950 p-4 transition hover:border-slate-700 sm:p-5"
                        >

                          <div className="flex min-w-0 items-center gap-4">

                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-3xl transition group-hover:scale-105">
                              {item.emoji ||
                                "📦"}
                            </div>

                            <div className="min-w-0">

                              <p className="truncate font-bold">
                                {item.name ||
                                  "Product"}
                              </p>

                              <p className="mt-1 text-xs text-slate-500">
                                {item.category ||
                                  "Product"}{" "}
                                · Quantity{" "}
                                {quantity}
                              </p>

                              <p className="mt-1 text-xs text-slate-600">
                                ₹
                                {price.toLocaleString(
                                  "en-IN"
                                )}{" "}
                                each
                              </p>

                            </div>

                          </div>

                          <div className="shrink-0 text-right">

                            <p className="font-black">
                              ₹
                              {total.toLocaleString(
                                "en-IN"
                              )}
                            </p>

                          </div>

                        </div>
                      );
                    }
                  )}

                </div>

                <div className="mt-6 flex items-center justify-between border-t border-slate-800 pt-5">

                  <span className="text-sm font-semibold text-slate-400">
                    Order Total
                  </span>

                  <span className="text-2xl font-black">
                    ₹
                    {amount.toLocaleString(
                      "en-IN",
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }
                    )}
                  </span>

                </div>

              </div>
            )}

          {/* =================================================
              SMART INSIGHT
          ================================================= */}

          <div className="mt-6 rounded-3xl border border-cyan-500/10 bg-cyan-500/[0.04] p-6 sm:p-8">

            <div className="flex items-start gap-4">

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-500/10 text-2xl">
                🤖
              </div>

              <div>

                <p className="text-xs font-bold uppercase tracking-widest text-cyan-400">
                  IntentCart Smart Insight
                </p>

                <h3 className="mt-1 text-lg font-bold">
                  Your purchase is securely recorded
                </h3>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  Your order has been successfully added
                  to the IntentCart transaction system.
                  Your payment was verified through
                  Razorpay and the transaction is safely
                  stored.
                </p>

              </div>

            </div>

          </div>

          {/* =================================================
              PAYMENT DETAILS TOGGLE
          ================================================= */}

          <div className="mt-6 overflow-hidden rounded-3xl border border-slate-800 bg-slate-900">

            <button
              onClick={() =>
                setShowPaymentDetails(
                  !showPaymentDetails
                )
              }
              className="flex w-full items-center justify-between p-6 text-left transition hover:bg-slate-800/50 sm:p-7"
            >

              <div>

                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  Transaction
                </p>

                <h2 className="mt-1 text-lg font-bold">
                  Payment Details
                </h2>

              </div>

              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-slate-400">
                {showPaymentDetails
                  ? "−"
                  : "+"}
              </span>

            </button>

            {showPaymentDetails && (

              <div className="border-t border-slate-800 p-6 sm:p-7">

                <div className="space-y-5">

                  <PaymentDetail
                    label="IntentCart Order ID"
                    value={
                      orderId
                        ? `#${orderId}`
                        : "Not available"
                    }
                  />

                  <PaymentDetail
                    label="Razorpay Order ID"
                    value={
                      payment?.razorpayOrderId ||
                      "Not available"
                    }
                    mono
                  />

                  <PaymentDetail
                    label="Razorpay Payment ID"
                    value={
                      payment?.razorpayPaymentId ||
                      "Not available"
                    }
                    mono
                  />

                  <PaymentDetail
                    label="Currency"
                    value={
                      payment?.currency ||
                      "INR"
                    }
                  />

                  <PaymentDetail
                    label="Payment Status"
                    value="Verified & Recorded"
                    success
                  />

                </div>

              </div>

            )}

          </div>

          {/* =================================================
              ACTIONS
          ================================================= */}

          <div className="mt-8 grid gap-3 sm:grid-cols-2">

            {orderId && (
              <Link
                href={`/order/${orderId}`}
                className="flex items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-6 py-4 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/10 transition hover:-translate-y-0.5 hover:bg-cyan-400"
              >
                📦 View Order Details
                <span>→</span>
              </Link>
            )}

            <Link
              href="/products"
              className="flex items-center justify-center gap-2 rounded-2xl border border-slate-700 bg-slate-900 px-6 py-4 text-sm font-semibold text-slate-300 transition hover:-translate-y-0.5 hover:border-cyan-500/30 hover:bg-slate-800 hover:text-white"
            >
              🛍️ Continue Shopping
            </Link>

          </div>

          {/* =================================================
              FOOTER
          ================================================= */}

          <div className="mt-12 text-center">

            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500 text-sm font-black text-slate-950">
              I
            </div>

            <p className="mt-3 text-sm font-semibold">
              IntentCart
            </p>

            <p className="mt-1 text-xs text-slate-600">
              Smarter shopping. Better decisions.
            </p>

            <p className="mt-4 text-[11px] text-slate-700">
              Your payment was securely processed
              through Razorpay.
            </p>

          </div>

        </div>

      </section>

    </main>
  );
}

/* ==========================================================
   PAYMENT DETAIL COMPONENT
========================================================== */

function PaymentDetail({
  label,
  value,
  mono = false,
  success = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
  success?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2 border-b border-slate-800 pb-5 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">

      <span className="text-sm text-slate-500">
        {label}
      </span>

      <span
        className={`break-all text-sm font-semibold sm:max-w-md sm:text-right ${
          mono
            ? "font-mono text-xs text-slate-300"
            : success
            ? "text-emerald-400"
            : "text-slate-200"
        }`}
      >
        {value}
      </span>

    </div>
  );
}
