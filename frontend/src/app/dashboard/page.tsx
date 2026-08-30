"use client";

import { useEffect, useState } from "react";

interface Order {
  id: number;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  amount: string;
  currency: string;
  status: string;
  created_at: string;
}

export default function Dashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/orders")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setOrders(data.orders);
        }
      })
      .catch((error) => {
        console.error("Dashboard error:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const totalRevenue = orders.reduce(
    (sum, order) => sum + Number(order.amount),
    0
  );

  const successfulPayments = orders.filter(
    (order) => order.status === "paid"
  ).length;

  return (
    <main className="min-h-screen bg-gray-100 p-6 md:p-10">
      <div className="max-w-6xl mx-auto">

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
  <div>
    <h1 className="text-3xl font-bold text-gray-900">
      IntentCart Dashboard
    </h1>

    <p className="text-gray-500 mt-1">
      Overview of your payment activity
    </p>
  </div>

  <div className="flex gap-3">
    <a
      href="/"
      className="bg-blue-600 text-white px-5 py-3 rounded-lg font-semibold hover:bg-blue-700"
    >
      Make Payment
    </a>

    <a
      href="/transactions"
      className="bg-gray-900 text-white px-5 py-3 rounded-lg font-semibold hover:bg-gray-800"
    >
      Transactions
    </a>
  </div>
</div>

        {loading ? (
          <p className="text-gray-500">
            Loading dashboard...
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <p className="text-gray-500">
                  Total Revenue
                </p>

                <h2 className="text-3xl font-bold mt-2">
                  ₹{totalRevenue.toFixed(2)}
                </h2>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <p className="text-gray-500">
                  Total Transactions
                </p>

                <h2 className="text-3xl font-bold mt-2">
                  {orders.length}
                </h2>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <p className="text-gray-500">
                  Successful Payments
                </p>

                <h2 className="text-3xl font-bold text-green-600 mt-2">
                  {successfulPayments}
                </h2>
              </div>

            </div>

            <div className="bg-white rounded-2xl shadow-sm mt-8 overflow-hidden">

              <div className="p-6 border-b">
                <h2 className="text-xl font-bold">
                  Recent Transactions
                </h2>
              </div>

              {orders.length === 0 ? (
                <p className="p-6 text-gray-500">
                  No transactions yet.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">

                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left p-4">ID</th>
                        <th className="text-left p-4">Amount</th>
                        <th className="text-left p-4">Status</th>
                        <th className="text-left p-4">Payment ID</th>
                        <th className="text-left p-4">Date</th>
                      </tr>
                    </thead>

                    <tbody>
                      {orders.map((order) => (
                        <tr
                          key={order.id}
                          className="border-t"
                        >
                          <td className="p-4">
                            #{order.id}
                          </td>

                          <td className="p-4 font-semibold">
                            ₹{Number(order.amount).toFixed(2)}
                          </td>

                          <td className="p-4">
                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                              {order.status.toUpperCase()}
                            </span>
                          </td>

                          <td className="p-4 font-mono text-sm">
                            {order.razorpay_payment_id}
                          </td>

                          <td className="p-4 text-gray-600">
                            {new Date(
                              order.created_at
                            ).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>

                  </table>
                </div>
              )}

            </div>
          </>
        )}
      </div>
    </main>
  );
}