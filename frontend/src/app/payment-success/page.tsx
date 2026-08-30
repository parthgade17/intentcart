"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type PaymentData = {
  databaseOrderId?: number;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  amount?: number | string;
  currency?: string;
  status?: string;
  items?: any[];
  paidAt?: string;
};

export default function PaymentSuccessPage() {
  const [payment, setPayment] =
    useState<PaymentData | null>(null);

  useEffect(() => {
    try {
      const savedPayment =
        localStorage.getItem(
          "intentcart_last_payment"
        );

      if (savedPayment) {
        const parsed = JSON.parse(savedPayment);

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
    }
  }, []);

  const orderId =
    payment?.databaseOrderId;

  const amount =
    Number(payment?.amount || 0);

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white md:p-10">

      <div className="mx-auto flex min-h-[80vh] max-w-3xl items-center justify-center">

        <div className="w-full rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center shadow-2xl md:p-12">

          {/* SUCCESS */}

          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 text-5xl text-emerald-400">
            ✓
          </div>

          <h1 className="mt-6 text-3xl font-bold">
            Payment Successful!
          </h1>

          <p className="mt-3 text-slate-400">
            Your payment has been successfully
            verified and recorded.
          </p>

          {/* AMOUNT */}

          <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-950 p-6">

            <p className="text-sm text-slate-400">
              Amount Paid
            </p>

            <p className="mt-2 text-4xl font-black">
              ₹
              {amount.toLocaleString(
                "en-IN",
                {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }
              )}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              {payment?.currency || "INR"}
            </p>

          </div>

          {/* PAYMENT INFORMATION */}

          <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950 p-6 text-left">

            <h2 className="mb-5 text-lg font-bold">
              Payment Information
            </h2>

            {/* ORDER ID */}

            <div className="mb-5">

              <p className="text-xs text-slate-500">
                IntentCart Order ID
              </p>

              <p className="mt-1 text-lg font-bold text-cyan-400">
                #{orderId || "Not available"}
              </p>

            </div>

            {/* RAZORPAY ORDER */}

            <div className="mb-5">

              <p className="text-xs text-slate-500">
                Razorpay Order ID
              </p>

              <p className="mt-1 break-all font-mono text-sm text-slate-200">
                {payment?.razorpayOrderId ||
                  "Not available"}
              </p>

            </div>

            {/* RAZORPAY PAYMENT */}

            <div className="mb-5">

              <p className="text-xs text-slate-500">
                Razorpay Payment ID
              </p>

              <p className="mt-1 break-all font-mono text-sm text-slate-200">
                {payment?.razorpayPaymentId ||
                  "Not available"}
              </p>

            </div>

            {/* STATUS */}

            <div>

              <p className="text-xs text-slate-500">
                Payment Status
              </p>

              <span className="mt-2 inline-block rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold uppercase text-emerald-400">
                {payment?.status || "paid"}
              </span>

            </div>

          </div>

          {/* PURCHASED ITEMS */}

          {payment?.items &&
            payment.items.length > 0 && (
              <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950 p-6 text-left">

                <h2 className="mb-5 text-lg font-bold">
                  Order Contents
                </h2>

                <div className="space-y-3">

                  {payment.items.map(
                    (item: any, index: number) => (
                      <div
                        key={
                          item.id ??
                          `${item.product_id}-${index}`
                        }
                        className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900 p-4"
                      >

                        <div className="flex items-center gap-3">

                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800 text-2xl">
                            {item.emoji || "📦"}
                          </div>

                          <div>

                            <p className="font-semibold">
                              {item.name}
                            </p>

                            <p className="text-xs text-slate-500">
                              {item.category ||
                                "Product"}{" "}
                              · Qty{" "}
                              {item.quantity}
                            </p>

                          </div>

                        </div>

                        <p className="font-bold">
                          ₹
                          {(
                            Number(
                              item.price
                            ) *
                            Number(
                              item.quantity
                            )
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </p>

                      </div>
                    )
                  )}

                </div>

              </div>
            )}

          {/* BUTTONS */}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">

            {orderId && (
              <Link
                href={`/order/${orderId}`}
                className="rounded-xl bg-cyan-500 px-6 py-3 font-bold text-slate-950 transition hover:bg-cyan-400"
              >
                View Order Details →
              </Link>
            )}

            <Link
              href="/transactions"
              className="rounded-xl border border-slate-700 px-6 py-3 font-semibold text-slate-300 transition hover:bg-slate-800"
            >
              View Transactions
            </Link>

            <Link
              href="/dashboard"
              className="rounded-xl border border-slate-700 px-6 py-3 font-semibold text-slate-300 transition hover:bg-slate-800"
            >
              Dashboard
            </Link>

          </div>

          {/* FOOTER */}

          <p className="mt-8 text-xs text-slate-600">
            IntentCart • PostgreSQL Order Intelligence
          </p>

        </div>

      </div>

    </main>
  );
}