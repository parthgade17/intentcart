"use client";

import { useState } from "react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function Home() {
  const [amount, setAmount] = useState("500");
  const [loading, setLoading] = useState(false);

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");

      script.src =
        "https://checkout.razorpay.com/v1/checkout.js";

      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);

      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    try {
      setLoading(true);

      const scriptLoaded = await loadRazorpay();

      if (!scriptLoaded) {
        alert("Razorpay SDK failed to load.");
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/create-order",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: Number(amount),
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();

        throw new Error(
          errorData.error || "Failed to create order"
        );
      }

      const result = await response.json();

      if (!result.success || !result.order) {
        throw new Error("Invalid order response");
      }

      const order = result.order;

      const options = {
        key: "rzp_test_TTcN3BLlA6NLrs",
        amount: order.amount,
        currency: order.currency,
        name: "IntentCart",
        description: "Test Payment",
        order_id: order.id,

        handler: async function (paymentResponse: any) {
          try {
            const verifyResponse = await fetch(
              "http://localhost:5000/api/verify-payment",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  razorpay_order_id:
                    paymentResponse.razorpay_order_id,

                  razorpay_payment_id:
                    paymentResponse.razorpay_payment_id,

                  razorpay_signature:
                    paymentResponse.razorpay_signature,
                }),
              }
            );

            const verifyResult =
              await verifyResponse.json();

            if (verifyResult.success) {
              alert(
                `Payment verified successfully! 🎉\n\nPayment ID: ${paymentResponse.razorpay_payment_id}\nAmount: ₹${amount}\n\nPayment saved to PostgreSQL.`
              );
            } else {
              alert(
                `Payment verification failed.\n\n${
                  verifyResult.error || "Unknown error"
                }`
              );
            }
          } catch (error) {
            console.error(
              "Verification error:",
              error
            );

            alert("Could not verify the payment.");
          }
        },

        modal: {
          ondismiss: function () {
            console.log(
              "Razorpay payment window closed."
            );
          },
        },

        theme: {
          color: "#2563eb",
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.open();
    } catch (error) {
      console.error(error);

      alert(
        "Something went wrong while creating the payment."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-6">
      <div className="w-full max-w-lg">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900">
            IntentCart
          </h1>

          <p className="text-gray-500 mt-2">
            Simple and secure digital payments
          </p>
        </div>

        {/* Payment Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-100 text-blue-600 text-2xl mb-4">
              ₹
            </div>

            <h2 className="text-2xl font-bold text-gray-900">
              Make a Payment
            </h2>

            <p className="text-gray-500 mt-1">
              Enter the amount you want to pay
            </p>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Payment Amount
            </label>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">
                ₹
              </span>

              <input
                type="number"
                value={amount}
                onChange={(e) =>
                  setAmount(e.target.value)
                }
                min="1"
                className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-4 text-xl font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Pay Button */}
          <button
            onClick={handlePayment}
            disabled={loading || !amount || Number(amount) <= 0}
            className="w-full mt-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-4 rounded-xl transition-all shadow-md hover:shadow-lg"
          >
            {loading
              ? "Processing..."
              : `Pay ₹${amount}`}
          </button>

          {/* Transactions Button */}
          <button
            onClick={() => {
              window.location.href = "/transactions";
            }}
            className="w-full mt-3 border border-gray-300 hover:bg-gray-50 text-gray-800 font-semibold py-4 rounded-xl transition"
          >
            View Transactions
          </button>

          {/* Test Mode */}
          <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-center">
            <p className="text-xs text-yellow-700 font-medium">
              ⚡ Razorpay Test Mode
            </p>
          </div>

        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Payments are securely processed using Razorpay
        </p>

      </div>
    </main>
  );
}