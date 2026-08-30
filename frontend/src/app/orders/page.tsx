"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Order = {
  id: number;
  razorpay_order_id: string;
  razorpay_payment_id: string | null;
  amount: string;
  currency: string;
  status: string;
  created_at: string;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://localhost:5000/api/orders"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(
          data.error || "Failed to fetch orders"
        );
      }

      setOrders(data.orders);
    } catch (err) {
      console.error("Orders error:", err);

      setError(
        "Unable to load order history. Make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // ==========================================
  // SUMMARY
  // ==========================================

  const totalOrders = orders.length;

  const paidOrders = orders.filter(
    (order) => order.status === "paid"
  );

  const paidCount = paidOrders.length;

  const totalSpent = paidOrders.reduce(
    (total, order) => total + Number(order.amount),
    0
  );

  // ==========================================
  // FILTERED ORDERS
  // ==========================================

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        order.razorpay_order_id
          .toLowerCase()
          .includes(searchText) ||
        (order.razorpay_payment_id || "")
          .toLowerCase()
          .includes(searchText) ||
        String(order.id).includes(searchText);

      const matchesStatus =
        statusFilter === "all" ||
        order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  // ==========================================
  // DATE FORMAT
  // ==========================================

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">

        {/* ==================================
            HEADER
        ================================== */}

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Order History
            </h1>

            <p className="mt-2 text-gray-600">
              View all your IntentCart transactions and
              payment details.
            </p>
          </div>

          <Link
            href="/"
            className="inline-flex w-fit items-center rounded-lg bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            ← Back to Shopping
          </Link>
        </div>

        {/* ==================================
            SUMMARY CARDS
        ================================== */}

        {!loading && !error && (
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">

            {/* Total Orders */}
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Total Orders
                  </p>

                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    {totalOrders}
                  </p>
                </div>

                <div className="text-3xl">
                  🧾
                </div>
              </div>
            </div>

            {/* Paid Orders */}
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Successful Orders
                  </p>

                  <p className="mt-2 text-3xl font-bold text-green-600">
                    {paidCount}
                  </p>
                </div>

                <div className="text-3xl">
                  ✅
                </div>
              </div>
            </div>

            {/* Total Spent */}
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Total Spent
                  </p>

                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    ₹{totalSpent.toLocaleString("en-IN")}
                  </p>
                </div>

                <div className="text-3xl">
                  💰
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ==================================
            SEARCH + FILTER
        ================================== */}

        {!loading && !error && orders.length > 0 && (
          <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm">

            <div className="flex flex-col gap-4 md:flex-row">

              {/* Search */}
              <div className="flex-1">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Search Orders
                </label>

                <input
                  type="text"
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Search Order ID or Payment ID..."
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black"
                />
              </div>

              {/* Filter */}
              <div className="w-full md:w-48">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Status
                </label>

                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
                >
                  <option value="all">
                    All Orders
                  </option>

                  <option value="paid">
                    Paid
                  </option>

                  <option value="created">
                    Pending
                  </option>
                </select>
              </div>

            </div>

            {/* Results */}
            <p className="mt-4 text-sm text-gray-500">
              Showing {filteredOrders.length} of{" "}
              {orders.length} orders
            </p>
          </div>
        )}

        {/* ==================================
            LOADING
        ================================== */}

        {loading && (
          <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
            <div className="text-4xl">
              ⏳
            </div>

            <p className="mt-4 text-gray-600">
              Loading your orders...
            </p>
          </div>
        )}

        {/* ==================================
            ERROR
        ================================== */}

        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <p className="font-medium text-red-700">
              {error}
            </p>

            <button
              onClick={fetchOrders}
              className="mt-4 rounded-lg bg-red-600 px-5 py-2 text-white transition hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* ==================================
            NO ORDERS
        ================================== */}

        {!loading &&
          !error &&
          orders.length === 0 && (
            <div className="rounded-2xl bg-white p-12 text-center shadow-sm">

              <div className="text-6xl">
                🧾
              </div>

              <h2 className="mt-5 text-xl font-semibold text-gray-900">
                No orders yet
              </h2>

              <p className="mt-2 text-gray-600">
                Your completed transactions will appear
                here.
              </p>

              <Link
                href="/"
                className="mt-6 inline-block rounded-lg bg-black px-6 py-3 text-sm font-medium text-white hover:bg-gray-800"
              >
                Start Shopping
              </Link>

            </div>
          )}

        {/* ==================================
            NO SEARCH RESULTS
        ================================== */}

        {!loading &&
          !error &&
          orders.length > 0 &&
          filteredOrders.length === 0 && (
            <div className="rounded-2xl bg-white p-12 text-center shadow-sm">

              <div className="text-5xl">
                🔍
              </div>

              <h2 className="mt-4 text-xl font-semibold text-gray-900">
                No matching orders
              </h2>

              <p className="mt-2 text-gray-600">
                Try a different search or status filter.
              </p>

            </div>
          )}

        {/* ==================================
            ORDER LIST
        ================================== */}

        {!loading &&
          !error &&
          filteredOrders.length > 0 && (
            <div className="space-y-5">

              {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md"
                >

                  {/* Top */}
                  <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                    <div>
                      <div className="flex flex-wrap items-center gap-3">

                        <h2 className="text-lg font-semibold text-gray-900">
                          Order #{order.id}
                        </h2>

                        {order.status === "paid" ? (
                          <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                            ✓ Paid
                          </span>
                        ) : (
                          <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-700">
                            ⏳ Pending
                          </span>
                        )}

                      </div>

                      <p className="mt-2 text-sm text-gray-500">
                        {formatDate(order.created_at)}
                      </p>
                    </div>

                    <div className="md:text-right">
                      <p className="text-2xl font-bold text-gray-900">
                        ₹
                        {Number(order.amount).toLocaleString(
                          "en-IN"
                        )}
                      </p>

                      <p className="text-sm text-gray-500">
                        {order.currency}
                      </p>
                    </div>

                  </div>

                  {/* Details */}
                  <div className="mt-6 grid gap-5 border-t border-gray-100 pt-5 md:grid-cols-2">

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        Razorpay Order ID
                      </p>

                      <p className="mt-1 break-all font-mono text-sm text-gray-800">
                        {order.razorpay_order_id}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        Razorpay Payment ID
                      </p>

                      <p className="mt-1 break-all font-mono text-sm text-gray-800">
                        {order.razorpay_payment_id ||
                          "Not paid yet"}
                      </p>
                    </div>

                  </div>

                </div>
              ))}

            </div>
          )}

      </div>
    </main>
  );
}