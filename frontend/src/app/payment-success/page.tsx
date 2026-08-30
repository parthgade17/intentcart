
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type PaymentDetails = {
  orderId: string;
  paymentId: string;
  amount: number;
  currency: string;
  status: string;
  paidAt: string;
};

export default function PaymentSuccessPage() {
  const router = useRouter();

  const [payment, setPayment] =
    useState<PaymentDetails | null>(null);

  useEffect(() => {
    try {
      const savedPayment =
        localStorage.getItem(
          "intentcart_last_payment"
        );

      if (savedPayment) {
        setPayment(
          JSON.parse(savedPayment)
        );
      }
    } catch {
      setPayment(null);
    }
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-5 py-10 text-white">

      <div className="w-full max-w-xl rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">

        {/* SUCCESS ICON */}

        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 text-5xl">
          ✅
        </div>

        <p className="mt-6 text-center text-xs font-bold uppercase tracking-widest text-emerald-400">
          Payment Successful
        </p>

        <h1 className="mt-3 text-center text-3xl font-black">
          Thank You for Your Order!
        </h1>

        <p className="mx-auto mt-4 max-w-md text-center text-sm leading-6 text-slate-400">
          Your payment has been successfully verified
          and your order has been confirmed.
        </p>

        {/* PAYMENT DETAILS */}

        {payment && (
          <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-950 p-5">

            <h2 className="mb-5 text-sm font-bold uppercase tracking-wider text-slate-400">
              Payment Details
            </h2>

            {/* AMOUNT */}

            <div className="flex items-center justify-between border-b border-slate-800 pb-4">

              <span className="text-sm text-slate-500">
                Amount Paid
              </span>

              <span className="text-xl font-black text-emerald-400">
                ₹
                {payment.amount.toLocaleString(
                  "en-IN"
                )}
              </span>

            </div>

            {/* ORDER ID */}

            <div className="mt-4">

              <p className="text-xs text-slate-500">
                Razorpay Order ID
              </p>

              <p className="mt-1 break-all text-sm font-semibold text-slate-300">
                {payment.orderId}
              </p>

            </div>

            {/* PAYMENT ID */}

            <div className="mt-4">

              <p className="text-xs text-slate-500">
                Razorpay Payment ID
              </p>

              <p className="mt-1 break-all text-sm font-semibold text-slate-300">
                {payment.paymentId}
              </p>

            </div>

            {/* STATUS */}

            <div className="mt-4 flex items-center justify-between">

              <span className="text-sm text-slate-500">
                Status
              </span>

              <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold uppercase text-emerald-400">
                {payment.status}
              </span>

            </div>

            {/* DATE */}

            <div className="mt-4 flex items-center justify-between">

              <span className="text-sm text-slate-500">
                Payment Date
              </span>

              <span className="text-sm font-semibold text-slate-300">
                {new Date(
                  payment.paidAt
                ).toLocaleString(
                  "en-IN"
                )}
              </span>

            </div>

          </div>
        )}

        {/* NO PAYMENT DETAILS */}

        {!payment && (
          <div className="mt-8 rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-4 text-center text-sm text-yellow-400">
            Payment was successful, but payment
            details could not be loaded.
          </div>
        )}

        {/* BUTTONS */}

        <button
          onClick={() =>
            router.push("/products")
          }
          className="mt-8 w-full rounded-xl bg-cyan-500 px-5 py-4 text-sm font-bold text-slate-950 transition hover:bg-cyan-400"
        >
          🛍️ Continue Shopping
        </button>

        <button
          onClick={() =>
            router.push("/")
          }
          className="mt-3 w-full rounded-xl border border-slate-700 bg-slate-950 px-5 py-3.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
        >
          Go to Home
        </button>

        {/* SECURITY */}

        <div className="mt-6 border-t border-slate-800 pt-5 text-center">

          <p className="text-[11px] text-slate-600">
            🔒 Payment securely processed and verified
            through Razorpay
          </p>

        </div>

      </div>

    </main>
  );
}
