"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

type Metrics = {
  totalRevenue: number;
  totalTransactions: number;
  averageOrderValue: number;
  successRate: number;
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

type AIResponse = {
  success: boolean;
  metrics?: Metrics;
  insights?: string;
  cached?: boolean;
  cachedAt?: string;
  quotaExceeded?: boolean;
  error?: string;
};

type Alert = {
  type: "danger" | "warning" | "info" | "success";
  icon: string;
  title: string;
  description: string;
};

type Action = {
  priority: "HIGH" | "MEDIUM" | "LOW";
  icon: string;
  title: string;
  issue: string;
  recommendation: string;
  action: string;
  filter?: string;
};

type RiskResult = {
  score: number;
  label: string;
  description: string;
  paymentHealth: number;
  revenueStability: number;
  transactionVolume: number;
  lowValueHealth: number;
};

const BACKEND_URL = "http://localhost:5000";

export default function AIInsightsPage() {
  const [data, setData] = useState<AIResponse | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // ==========================================================
  // FETCH AI INSIGHTS
  // ==========================================================

  const fetchInsights = useCallback(async (refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await fetch(
        `${BACKEND_URL}/api/ai-insights`,
        {
          cache: "no-store",
        }
      );

      const result: AIResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error || "Unable to load AI insights"
        );
      }

      setData(result);
    } catch (err) {
      console.error("AI insights error:", err);

      setError(
        "Unable to load AI analysis. Make sure your backend is running."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // ==========================================================
  // FETCH ORDERS
  // ==========================================================

  const fetchOrders = useCallback(async () => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/orders`,
        {
          cache: "no-store",
        }
      );

      if (!response.ok) return;

      const result = await response.json();

      if (
        result.success &&
        Array.isArray(result.orders)
      ) {
        setOrders(result.orders);
      }
    } catch (err) {
      console.error("Orders error:", err);
    }
  }, []);

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    fetchInsights();
    fetchOrders();
  }, [fetchInsights, fetchOrders]);

  // ==========================================================
  // LIVE DATA
  // ==========================================================

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const [metricsResponse, ordersResponse] =
          await Promise.all([
            fetch(`${BACKEND_URL}/api/metrics`, {
              cache: "no-store",
            }),
            fetch(`${BACKEND_URL}/api/orders`, {
              cache: "no-store",
            }),
          ]);

        if (metricsResponse.ok) {
          const result = await metricsResponse.json();

          if (
            result.success &&
            result.metrics
          ) {
            setData((previous) => ({
              ...(previous || { success: true }),
              metrics: result.metrics,
            }));
          }
        }

        if (ordersResponse.ok) {
          const result = await ordersResponse.json();

          if (
            result.success &&
            Array.isArray(result.orders)
          ) {
            setOrders(result.orders);
          }
        }
      } catch (err) {
        console.error("Live update error:", err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // ==========================================================
  // CHART DATA
  // ==========================================================

  const chartData = useMemo(() => {
    const paidOrders = orders
      .filter(
        (order) =>
          order.status.toLowerCase() === "paid"
      )
      .sort(
        (a, b) =>
          new Date(a.created_at).getTime() -
          new Date(b.created_at).getTime()
      );

    let runningRevenue = 0;

    return paidOrders.map((order, index) => {
      const amount = Number(order.amount);

      runningRevenue += amount;

      const date = new Date(order.created_at);

      return {
        name: `Payment ${index + 1}`,
        revenue: amount,
        totalRevenue: runningRevenue,
        transactions: index + 1,
        aov: Math.round(
          runningRevenue / (index + 1)
        ),
        date: date.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
        }),
      };
    });
  }, [orders]);

  // ==========================================================
  // RISK SCORE
  // ==========================================================

  const risk = useMemo<RiskResult>(() => {
    if (orders.length === 0) {
      return {
        score: 0,
        label: "NO DATA",
        description:
          "No transactions are available for analysis.",
        paymentHealth: 0,
        revenueStability: 0,
        transactionVolume: 0,
        lowValueHealth: 0,
      };
    }

    const paidOrders = orders.filter(
      (order) =>
        order.status.toLowerCase() === "paid"
    );

    const failedOrders = orders.filter(
      (order) =>
        order.status.toLowerCase() === "failed"
    );

    const paymentHealth = Math.round(
      (paidOrders.length / orders.length) * 100
    );

    const transactionVolume = Math.min(
      100,
      Math.round((orders.length / 20) * 100)
    );

    const lowValueOrders = paidOrders.filter(
      (order) => Number(order.amount) < 100
    );

    const lowValueRatio =
      paidOrders.length > 0
        ? lowValueOrders.length /
          paidOrders.length
        : 0;

    const lowValueHealth = Math.max(
      0,
      Math.round(100 - lowValueRatio * 100)
    );

    const amounts = paidOrders.map((order) =>
      Number(order.amount)
    );

    let revenueStability = 100;

    if (amounts.length >= 2) {
      const average =
        amounts.reduce(
          (sum, value) => sum + value,
          0
        ) / amounts.length;

      const variance =
        amounts.reduce(
          (sum, value) =>
            sum +
            Math.pow(value - average, 2),
          0
        ) / amounts.length;

      const standardDeviation =
        Math.sqrt(variance);

      const coefficient =
        average > 0
          ? standardDeviation / average
          : 0;

      revenueStability = Math.max(
        0,
        Math.round(
          100 -
            Math.min(
              100,
              coefficient * 100
            )
        )
      );
    }

    const healthScore = Math.round(
      paymentHealth * 0.4 +
        revenueStability * 0.25 +
        transactionVolume * 0.15 +
        lowValueHealth * 0.2
    );

    let score = 100 - healthScore;

    if (failedOrders.length > 0) {
      score += Math.min(
        15,
        failedOrders.length * 5
      );
    }

    const confidence = Math.min(
      1,
      orders.length / 10
    );

    score = Math.round(
      score * (0.6 + confidence * 0.4)
    );

    score = Math.max(
      0,
      Math.min(100, score)
    );

    let label = "LOW RISK";
    let description =
      "Payment activity currently appears healthy.";

    if (score >= 70) {
      label = "HIGH RISK";
      description =
        "Several financial indicators require immediate attention.";
    } else if (score >= 40) {
      label = "MEDIUM RISK";
      description =
        "Some financial indicators should be monitored closely.";
    }

    if (orders.length < 10) {
      description +=
        " Risk confidence is limited because the transaction dataset is still small.";
    }

    return {
      score,
      label,
      description,
      paymentHealth,
      revenueStability,
      transactionVolume,
      lowValueHealth,
    };
  }, [orders]);

  // ==========================================================
  // FINANCE ALERTS
  // ==========================================================

  const alerts = useMemo<Alert[]>(() => {
    const result: Alert[] = [];

    if (orders.length === 0) {
      return [
        {
          type: "info",
          icon: "ℹ️",
          title: "No transactions yet",
          description:
            "IntentCart is waiting for its first transaction.",
        },
      ];
    }

    const failedOrders = orders.filter(
      (order) =>
        order.status.toLowerCase() === "failed"
    );

    if (failedOrders.length > 0) {
      result.push({
        type: "danger",
        icon: "🔴",
        title: `${failedOrders.length} payment failure${
          failedOrders.length > 1 ? "s" : ""
        } detected`,
        description:
          "Review failed transactions and investigate possible payment gateway or authorization issues.",
      });
    }

    const lowValueOrders = orders.filter(
      (order) =>
        order.status.toLowerCase() === "paid" &&
        Number(order.amount) < 100
    );

    if (lowValueOrders.length > 0) {
      result.push({
        type: "warning",
        icon: "⚠️",
        title: "Low-value transactions detected",
        description: `${lowValueOrders.length} successful transaction${
          lowValueOrders.length > 1
            ? "s"
            : ""
        } below ₹100 may experience higher relative processing costs.`,
      });
    }

    if (orders.length >= 2) {
      const sorted = [...orders].sort(
        (a, b) =>
          new Date(a.created_at).getTime() -
          new Date(b.created_at).getTime()
      );

      const previous = Number(
        sorted[sorted.length - 2].amount
      );

      const latest = Number(
        sorted[sorted.length - 1].amount
      );

      if (
        previous > 0 &&
        latest < previous
      ) {
        const drop =
          ((previous - latest) /
            previous) *
          100;

        if (drop >= 30) {
          result.push({
            type: "warning",
            icon: "📉",
            title: `Transaction value dropped ${Math.round(
              drop
            )}%`,
            description: `The latest transaction was ₹${latest.toLocaleString(
              "en-IN"
            )}, compared with ₹${previous.toLocaleString(
              "en-IN"
            )} previously.`,
          });
        }
      }
    }

    if (orders.length < 10) {
      result.push({
        type: "info",
        icon: "📊",
        title: "Small transaction dataset",
        description:
          "Continue collecting payments before making long-term financial decisions.",
      });
    }

    if (
      failedOrders.length === 0 &&
      orders.length > 0
    ) {
      result.push({
        type: "success",
        icon: "✅",
        title: "Payment system healthy",
        description:
          "All currently recorded transactions have no detected payment failures.",
      });
    }

    return result;
  }, [orders]);

  // ==========================================================
  // AI ACTION CENTER
  // ==========================================================

  const actions = useMemo<Action[]>(() => {
    const result: Action[] = [];

    const failedOrders = orders.filter(
      (order) =>
        order.status.toLowerCase() === "failed"
    );

    const lowValueOrders = orders.filter(
      (order) =>
        order.status.toLowerCase() === "paid" &&
        Number(order.amount) < 100
    );

    if (failedOrders.length > 0) {
      result.push({
        priority: "HIGH",
        icon: "🚨",
        title: "Payment failures detected",
        issue: `${failedOrders.length} failed payment${
          failedOrders.length > 1 ? "s" : ""
        } found.`,
        recommendation:
          "Investigate failed payments before focusing on revenue growth.",
        action:
          "Review failed Razorpay transactions and identify recurring failure reasons.",
        filter: "failed",
      });
    }

    if (risk.score >= 70) {
      result.push({
        priority: "HIGH",
        icon: "🛡️",
        title: "Financial risk requires attention",
        issue: `Current risk score is ${risk.score}/100.`,
        recommendation:
          "Prioritize risk reduction before increasing transaction volume.",
        action:
          "Review payment failures, order values and revenue volatility.",
      });
    } else if (risk.score >= 40) {
      result.push({
        priority: "MEDIUM",
        icon: "🔎",
        title: "Monitor financial risk",
        issue: `Current risk score is ${risk.score}/100.`,
        recommendation:
          "Continue monitoring transaction health and order-value changes.",
        action:
          "Review the Finance Alerts section regularly.",
      });
    }

    if (lowValueOrders.length > 0) {
      result.push({
        priority:
          lowValueOrders.length >= 2
            ? "MEDIUM"
            : "LOW",
        icon: "🛒",
        title: "Low-value orders detected",
        issue: `${lowValueOrders.length} successful order${
          lowValueOrders.length > 1
            ? "s"
            : ""
        } below ₹100.`,
        recommendation:
          "Increase basket size so payment processing costs represent a smaller percentage of revenue.",
        action:
          "Add checkout upsells or introduce a ₹100–₹150 minimum basket threshold.",
        filter: "paid",
      });
    }

    if (risk.revenueStability < 60) {
      result.push({
        priority: "MEDIUM",
        icon: "📉",
        title: "Revenue volatility detected",
        issue:
          "Transaction values are changing significantly between payments.",
        recommendation:
          "Track AOV and transaction trends before forecasting future revenue.",
        action:
          "Monitor the Revenue Trend chart over the next several transactions.",
      });
    }

    if (orders.length < 10) {
      result.push({
        priority: "LOW",
        icon: "📊",
        title: "Collect more transaction data",
        issue: `Only ${orders.length} transaction${
          orders.length !== 1 ? "s" : ""
        } currently exist.`,
        recommendation:
          "A larger dataset will make financial risk analysis more reliable.",
        action:
          "Continue processing transactions and reassess after reaching 10+ transactions.",
      });
    }

    if (
      orders.length > 0 &&
      failedOrders.length === 0 &&
      risk.score < 40
    ) {
      result.push({
        priority: "LOW",
        icon: "✅",
        title: "Payment system is healthy",
        issue:
          "No immediate payment reliability problem is detected.",
        recommendation:
          "Maintain the current payment flow while continuing to monitor performance.",
        action:
          "Continue monitoring payment success rate and AOV.",
      });
    }

    return result;
  }, [orders, risk]);

  // ==========================================================
  // ACTION CLICK
  // ==========================================================

  const handleAction = (action: Action) => {
    if (action.filter) {
      setStatusFilter(action.filter);
      setSearch("");
    }

    document
      .getElementById("transactions")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  };

  // ==========================================================
  // FILTER TRANSACTIONS
  // ==========================================================

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const searchValue =
        search.toLowerCase();

      const matchesSearch =
        order.razorpay_order_id
          ?.toLowerCase()
          .includes(searchValue) ||
        order.razorpay_payment_id
          ?.toLowerCase()
          .includes(searchValue) ||
        order.status
          ?.toLowerCase()
          .includes(searchValue) ||
        order.amount
          ?.toString()
          .includes(searchValue);

      const matchesStatus =
        statusFilter === "all" ||
        order.status?.toLowerCase() ===
          statusFilter.toLowerCase();

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    orders,
    search,
    statusFilter,
  ]);

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
        <div className="text-center">
          <div className="mx-auto mb-5 h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-cyan-400" />

          <h2 className="text-xl font-semibold">
            Loading AI Finance Controller
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Loading transaction intelligence...
          </p>
        </div>
      </main>
    );
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
        <div className="w-full max-w-lg rounded-2xl border border-red-500/20 bg-slate-900 p-8 text-center">

          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-2xl">
            ⚠️
          </div>

          <h2 className="text-xl font-semibold">
            Unable to load analysis
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            {error}
          </p>

          <button
            onClick={() => {
              fetchInsights(true);
              fetchOrders();
            }}
            className="mt-6 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-400"
          >
            Try Again
          </button>

        </div>
      </main>
    );
  }

  const metrics = data?.metrics;

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-10">

      <div className="mx-auto max-w-7xl">

        {/* HEADER */}

        <header className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

          <div>

            <div className="mb-2 flex items-center gap-2">

              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
                ✦
              </span>

              <span className="text-sm font-medium text-cyan-400">
                IntentCart Intelligence
              </span>

            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              AI Finance Controller
            </h1>

            <p className="mt-2 text-sm text-slate-400 sm:text-base">
              Real-time financial intelligence powered by PostgreSQL, Razorpay and Gemini AI.
            </p>

          </div>

          <button
            onClick={() => {
              fetchInsights(true);
              fetchOrders();
            }}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-semibold hover:border-cyan-500/50 hover:bg-slate-800 disabled:opacity-60"
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
              : "Refresh Dashboard"}
          </button>

        </header>

        {/* SYSTEM STATUS */}

        <section className="mb-6 grid gap-3 sm:grid-cols-3">

          <StatusCard
            title="Gemini AI"
            status="Online"
            icon="✦"
          />

          <StatusCard
            title="PostgreSQL"
            status="Connected"
            icon="▣"
          />

          <StatusCard
            title="Razorpay"
            status="Active"
            icon="₹"
          />

        </section>

        {/* LIVE */}

        <div className="mb-6 flex items-center justify-between rounded-xl border border-emerald-500/10 bg-emerald-500/5 px-4 py-3">

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
            Updates every 5 seconds
          </span>

        </div>

        {/* METRICS */}

        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <MetricCard
            title="Total Revenue"
            value={`₹${(
              metrics?.totalRevenue ?? 0
            ).toLocaleString("en-IN")}`}
            description="Gross successful revenue"
            icon="₹"
          />

          <MetricCard
            title="Transactions"
            value={(
              metrics?.totalTransactions ?? 0
            ).toString()}
            description="Total recorded payments"
            icon="↗"
          />

          <MetricCard
            title="Average Order Value"
            value={`₹${(
              metrics?.averageOrderValue ?? 0
            ).toLocaleString("en-IN")}`}
            description="Average successful order"
            icon="◈"
          />

          <MetricCard
            title="Success Rate"
            value={`${
              metrics?.successRate ?? 0
            }%`}
            description="Payment success rate"
            icon="✓"
          />

        </section>

        {/* RISK SCORE */}

        <section className="mb-8 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">

          <div className="border-b border-slate-800 px-6 py-5">

            <p className="text-xs font-semibold uppercase tracking-widest text-purple-400">
              Automated Financial Intelligence
            </p>

            <h2 className="mt-1 text-xl font-bold">
              Financial Risk Score
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Calculated from live transaction data
            </p>

          </div>

          <div className="grid gap-8 p-6 lg:grid-cols-[280px_1fr] lg:p-8">

            <div className="flex flex-col items-center justify-center">

              <div className="flex h-52 w-52 items-center justify-center rounded-full border-[18px] border-slate-800">

                <div className="text-center">

                  <div
                    className={`text-5xl font-black ${
                      risk.score >= 70
                        ? "text-red-400"
                        : risk.score >= 40
                        ? "text-amber-400"
                        : "text-emerald-400"
                    }`}
                  >
                    {risk.score}
                  </div>

                  <div className="mt-1 text-xs uppercase tracking-widest text-slate-500">
                    / 100
                  </div>

                </div>

              </div>

              <div
                className={`mt-5 rounded-full px-4 py-2 text-sm font-bold ${
                  risk.score >= 70
                    ? "bg-red-500/10 text-red-400"
                    : risk.score >= 40
                    ? "bg-amber-500/10 text-amber-400"
                    : "bg-emerald-500/10 text-emerald-400"
                }`}
              >
                {risk.label}
              </div>

              <p className="mt-3 max-w-xs text-center text-xs leading-5 text-slate-500">
                {risk.description}
              </p>

            </div>

            <div>

              <RiskBar
                title="Payment Health"
                value={risk.paymentHealth}
                description="Successful payment ratio"
              />

              <RiskBar
                title="Revenue Stability"
                value={risk.revenueStability}
                description="Consistency of transaction values"
              />

              <RiskBar
                title="Transaction Volume"
                value={risk.transactionVolume}
                description="Confidence from transaction volume"
              />

              <RiskBar
                title="Low-Value Order Health"
                value={risk.lowValueHealth}
                description="Protection against micro-transactions"
              />

              {orders.length < 10 && (
                <div className="mt-5 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">

                  <p className="text-sm font-semibold text-amber-400">
                    ℹ️ Limited data confidence
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Only {orders.length} transaction
                    {orders.length !== 1
                      ? "s"
                      : ""}{" "}
                    currently exist. Collect more payments for stronger financial analysis.
                  </p>

                </div>
              )}

            </div>

          </div>

        </section>

        {/* ==================================================
            AI ACTION CENTER
        ================================================== */}

        <section className="mb-8 overflow-hidden rounded-2xl border border-cyan-500/20 bg-slate-900">

          <div className="border-b border-slate-800 bg-cyan-500/[0.03] px-6 py-6">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <div className="flex items-center gap-2">

                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
                    ✦
                  </span>

                  <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400">
                    Intelligent Decision Support
                  </p>

                </div>

                <h2 className="mt-3 text-2xl font-bold">
                  AI Action Center
                </h2>

                <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-400">
                  IntentCart converts live transaction signals into practical financial actions.
                </p>

              </div>

              <div className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3">

                <p className="text-xs text-slate-500">
                  Current Risk
                </p>

                <p
                  className={`mt-1 text-lg font-bold ${
                    risk.score >= 70
                      ? "text-red-400"
                      : risk.score >= 40
                      ? "text-amber-400"
                      : "text-emerald-400"
                  }`}
                >
                  {risk.score}/100
                </p>

              </div>

            </div>

          </div>

          <div className="p-5">

            {actions.length === 0 ? (

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-8 text-center">

                <div className="text-3xl">
                  🎯
                </div>

                <h3 className="mt-3 font-semibold">
                  No actions required
                </h3>

              </div>

            ) : (

              <div className="grid gap-4 lg:grid-cols-2">

                {actions.map(
                  (action, index) => (
                    <ActionCard
                      key={`${action.title}-${index}`}
                      action={action}
                      onAction={() =>
                        handleAction(action)
                      }
                    />
                  )
                )}

              </div>

            )}

          </div>

        </section>

        {/* CHARTS */}

        <section className="mb-8 grid gap-6 lg:grid-cols-2">

          <ChartCard
            title="Revenue Trend"
            subtitle="Successful payment revenue over time"
          >
            {chartData.length === 0 ? (
              <EmptyChart />
            ) : (
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <LineChart data={chartData}>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#334155"
                  />

                  <XAxis
                    dataKey="date"
                    tick={{
                      fill: "#94a3b8",
                      fontSize: 12,
                    }}
                  />

                  <YAxis
                    tick={{
                      fill: "#94a3b8",
                      fontSize: 12,
                    }}
                  />

                  <Tooltip
                    contentStyle={{
                      backgroundColor:
                        "#0f172a",
                      border:
                        "1px solid #334155",
                      borderRadius: "10px",
                      color: "#fff",
                    }}
                  />

                  <Legend />

                  <Line
                    type="monotone"
                    dataKey="revenue"
                    name="Payment Revenue"
                    stroke="#22d3ee"
                    strokeWidth={3}
                    dot={{ r: 5 }}
                  />

                  <Line
                    type="monotone"
                    dataKey="totalRevenue"
                    name="Cumulative Revenue"
                    stroke="#a78bfa"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                  />

                </LineChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          <ChartCard
            title="Transaction Growth"
            subtitle="Transactions and average order value"
          >
            {chartData.length === 0 ? (
              <EmptyChart />
            ) : (
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <LineChart data={chartData}>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#334155"
                  />

                  <XAxis
                    dataKey="date"
                    tick={{
                      fill: "#94a3b8",
                      fontSize: 12,
                    }}
                  />

                  <YAxis
                    tick={{
                      fill: "#94a3b8",
                      fontSize: 12,
                    }}
                  />

                  <Tooltip
                    contentStyle={{
                      backgroundColor:
                        "#0f172a",
                      border:
                        "1px solid #334155",
                      borderRadius: "10px",
                      color: "#fff",
                    }}
                  />

                  <Legend />

                  <Line
                    type="monotone"
                    dataKey="transactions"
                    name="Transactions"
                    stroke="#34d399"
                    strokeWidth={3}
                    dot={{ r: 5 }}
                  />

                  <Line
                    type="monotone"
                    dataKey="aov"
                    name="Average Order Value"
                    stroke="#f59e0b"
                    strokeWidth={3}
                    dot={{ r: 5 }}
                  />

                </LineChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

        </section>

        {/* FINANCE ALERTS */}

        <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900">

          <div className="border-b border-slate-800 px-6 py-5">

            <p className="text-xs font-semibold uppercase tracking-widest text-amber-400">
              Automated Monitoring
            </p>

            <h2 className="mt-1 text-xl font-bold">
              Finance Alerts
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Rule-based alerts from live transaction data
            </p>

          </div>

          <div className="grid gap-3 p-5">

            {alerts.map(
              (alert, index) => (
                <AlertCard
                  key={`${alert.title}-${index}`}
                  alert={alert}
                />
              )
            )}

          </div>

        </section>

        {/* GEMINI AI */}

        <section className="mb-8 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">

          <div className="border-b border-slate-800 px-6 py-5">

            <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400">
              AI Recommendation Engine
            </p>

            <h2 className="mt-1 text-xl font-bold">
              Gemini Transaction Intelligence
            </h2>

          </div>

          <div className="px-6 py-8 sm:px-10">

            {data?.quotaExceeded ? (

              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-6">

                <div className="text-2xl">
                  ⏳
                </div>

                <h3 className="mt-3 text-lg font-semibold">
                  Gemini free-tier limit reached
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Your metrics, charts, risk score and Action Center continue working without Gemini.
                </p>

                {data.insights && (
                  <div className="mt-6 border-t border-amber-500/10 pt-6">

                    <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Last saved analysis
                    </p>

                    <article className="ai-markdown">
                      <ReactMarkdown>
                        {data.insights}
                      </ReactMarkdown>
                    </article>

                  </div>
                )}

              </div>

            ) : (

              <article className="ai-markdown">
                <ReactMarkdown>
                  {data?.insights ||
                    "No AI analysis available."}
                </ReactMarkdown>
              </article>

            )}

          </div>

        </section>

        {/* ==================================================
            TRANSACTIONS
        ================================================== */}

        <section
          id="transactions"
          className="scroll-mt-6 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900"
        >

          <div className="border-b border-slate-800 px-6 py-5">

            <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400">
              Payment Ledger
            </p>

            <h2 className="mt-1 text-xl font-bold">
              Transaction History
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Live transactions from PostgreSQL
            </p>

          </div>

          <div className="border-b border-slate-800 p-5">

            <div className="grid gap-3 md:grid-cols-[1fr_180px]">

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search transaction ID, payment ID, amount..."
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-500/50"
              />

              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value)
                }
                className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500/50"
              >

                <option value="all">
                  All statuses
                </option>

                <option value="paid">
                  Paid
                </option>

                <option value="created">
                  Created
                </option>

                <option value="failed">
                  Failed
                </option>

              </select>

            </div>

          </div>

          {filteredOrders.length === 0 ? (

            <div className="px-6 py-14 text-center">

              <h3 className="font-semibold">
                No transactions found
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Try changing your search or status filter.
              </p>

            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full min-w-[800px] text-left">

                <thead>

                  <tr className="border-b border-slate-800 text-xs uppercase tracking-wider text-slate-500">

                    <th className="px-6 py-4">
                      Transaction
                    </th>

                    <th className="px-6 py-4">
                      Payment ID
                    </th>

                    <th className="px-6 py-4">
                      Amount
                    </th>

                    <th className="px-6 py-4">
                      Status
                    </th>

                    <th className="px-6 py-4">
                      Date
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredOrders.map(
                    (order) => (
                      <tr
                        key={order.id}
                        className="border-b border-slate-800/70 hover:bg-slate-800/30"
                      >

                        <td className="px-6 py-5">

                          <p className="font-semibold">
                            #{order.id}
                          </p>

                          <p className="mt-1 max-w-[220px] truncate text-xs text-slate-500">
                            {
                              order.razorpay_order_id
                            }
                          </p>

                        </td>

                        <td className="px-6 py-5">

                          <p className="max-w-[220px] truncate text-xs text-slate-400">
                            {
                              order.razorpay_payment_id ||
                              "Not available"
                            }
                          </p>

                        </td>

                        <td className="px-6 py-5">

                          <p className="font-semibold">
                            ₹
                            {Number(
                              order.amount
                            ).toLocaleString(
                              "en-IN",
                              {
                                minimumFractionDigits: 2,
                              }
                            )}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {order.currency}
                          </p>

                        </td>

                        <td className="px-6 py-5">

                          <StatusBadge
                            status={
                              order.status
                            }
                          />

                        </td>

                        <td className="px-6 py-5">

                          <p className="text-sm text-slate-300">
                            {new Date(
                              order.created_at
                            ).toLocaleDateString(
                              "en-IN"
                            )}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {new Date(
                              order.created_at
                            ).toLocaleTimeString(
                              "en-IN",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </p>

                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </section>

        <footer className="mt-8 border-t border-slate-800 pt-6 text-center text-xs text-slate-500">
          IntentCart AI Finance Controller • Live PostgreSQL Intelligence
        </footer>

      </div>

      {/* MARKDOWN */}

      <style jsx global>{`

        .ai-markdown {
          color: #cbd5e1;
          font-size: 0.95rem;
          line-height: 1.8;
        }

        .ai-markdown h1 {
          margin-bottom: 1.25rem;
          font-size: 1.8rem;
          font-weight: 800;
          color: white;
        }

        .ai-markdown h2 {
          margin-top: 2.5rem;
          margin-bottom: 1rem;
          padding-bottom: 0.65rem;
          border-bottom: 1px solid rgb(51 65 85);
          font-size: 1.35rem;
          font-weight: 800;
          color: white;
        }

        .ai-markdown h2:first-child {
          margin-top: 0;
        }

        .ai-markdown h3 {
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          font-size: 1.1rem;
          font-weight: 700;
          color: #f8fafc;
        }

        .ai-markdown p {
          margin: 0.75rem 0;
        }

        .ai-markdown ul,
        .ai-markdown ol {
          margin: 1rem 0;
          padding-left: 1.5rem;
        }

        .ai-markdown ul {
          list-style-type: disc;
        }

        .ai-markdown ol {
          list-style-type: decimal;
        }

        .ai-markdown li {
          margin: 0.55rem 0;
        }

        .ai-markdown strong {
          font-weight: 800;
          color: white;
        }

        .ai-markdown code {
          border-radius: 0.35rem;
          background: rgb(15 23 42);
          padding: 0.15rem 0.4rem;
          font-size: 0.85em;
          color: #67e8f9;
        }

      `}</style>

    </main>
  );
}

// ==========================================================
// STATUS CARD
// ==========================================================

function StatusCard({
  title,
  status,
  icon,
}: {
  title: string;
  status: string;
  icon: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900 px-5 py-4">

      <div className="flex items-center gap-3">

        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-cyan-400">
          {icon}
        </div>

        <div>

          <p className="text-sm font-semibold">
            {title}
          </p>

          <p className="text-xs text-slate-500">
            Current system status
          </p>

        </div>

      </div>

      <div className="flex items-center gap-2 text-xs font-medium text-emerald-400">

        <span className="h-2 w-2 rounded-full bg-emerald-400" />

        {status}

      </div>

    </div>
  );
}

// ==========================================================
// METRIC CARD
// ==========================================================

function MetricCard({
  title,
  value,
  description,
  icon,
}: {
  title: string;
  value: string;
  description: string;
  icon: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">

      <div className="flex items-start justify-between">

        <div>

          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {title}
          </p>

          <p className="mt-3 text-2xl font-bold">
            {value}
          </p>

        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
          {icon}
        </div>

      </div>

      <p className="mt-3 text-xs text-slate-500">
        {description}
      </p>

    </div>
  );
}

// ==========================================================
// RISK BAR
// ==========================================================

function RiskBar({
  title,
  value,
  description,
}: {
  title: string;
  value: number;
  description: string;
}) {
  return (
    <div className="mb-6">

      <div className="mb-2 flex items-center justify-between">

        <div>

          <p className="text-sm font-semibold text-slate-200">
            {title}
          </p>

          <p className="text-xs text-slate-500">
            {description}
          </p>

        </div>

        <span className="text-sm font-bold">
          {value}%
        </span>

      </div>

      <div className="h-2 overflow-hidden rounded-full bg-slate-800">

        <div
          className={`h-full rounded-full transition-all ${
            value >= 70
              ? "bg-emerald-400"
              : value >= 40
              ? "bg-amber-400"
              : "bg-red-400"
          }`}
          style={{
            width: `${value}%`,
          }}
        />

      </div>

    </div>
  );
}

// ==========================================================
// ACTION CARD
// ==========================================================

function ActionCard({
  action,
  onAction,
}: {
  action: Action;
  onAction: () => void;
}) {
  const priorityStyle =
    action.priority === "HIGH"
      ? "border-red-500/20 bg-red-500/10 text-red-400"
      : action.priority === "MEDIUM"
      ? "border-amber-500/20 bg-amber-500/10 text-amber-400"
      : "border-emerald-500/20 bg-emerald-500/10 text-emerald-400";

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 transition hover:border-slate-700">

      <div className="flex items-start justify-between gap-4">

        <div className="flex items-center gap-3">

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-xl">
            {action.icon}
          </div>

          <div>

            <h3 className="font-bold">
              {action.title}
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              AI-detected financial signal
            </p>

          </div>

        </div>

        <span
          className={`rounded-full border px-2.5 py-1 text-[10px] font-bold tracking-wider ${priorityStyle}`}
        >
          {action.priority}
        </span>

      </div>

      <div className="mt-5 space-y-4">

        <div>

          <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-600">
            Issue
          </p>

          <p className="text-sm leading-6 text-slate-400">
            {action.issue}
          </p>

        </div>

        <div>

          <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-cyan-500">
            Recommendation
          </p>

          <p className="text-sm leading-6 text-slate-300">
            {action.recommendation}
          </p>

        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">

          <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-emerald-500">
            Suggested Action
          </p>

          <p className="text-sm font-medium leading-6 text-white">
            {action.action}
          </p>

          <button
            onClick={onAction}
            className="mt-4 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-semibold text-cyan-400 transition hover:border-cyan-500/50 hover:bg-slate-800"
          >
            View Transactions →
          </button>

        </div>

      </div>

    </div>
  );
}

// ==========================================================
// CHART CARD
// ==========================================================

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

      <div className="mb-6">

        <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400">
          Analytics
        </p>

        <h2 className="mt-1 text-xl font-bold">
          {title}
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          {subtitle}
        </p>

      </div>

      <div className="h-[300px] w-full">
        {children}
      </div>

    </div>
  );
}

// ==========================================================
// EMPTY CHART
// ==========================================================

function EmptyChart() {
  return (
    <div className="flex h-full items-center justify-center text-sm text-slate-500">
      No successful transactions available.
    </div>
  );
}

// ==========================================================
// ALERT CARD
// ==========================================================

function AlertCard({
  alert,
}: {
  alert: Alert;
}) {
  const styles = {
    danger:
      "border-red-500/20 bg-red-500/5 text-red-400",
    warning:
      "border-amber-500/20 bg-amber-500/5 text-amber-400",
    info:
      "border-cyan-500/20 bg-cyan-500/5 text-cyan-400",
    success:
      "border-emerald-500/20 bg-emerald-500/5 text-emerald-400",
  };

  return (
    <div
      className={`rounded-xl border p-4 ${styles[alert.type]}`}
    >

      <div className="flex gap-4">

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-950/50 text-lg">
          {alert.icon}
        </div>

        <div>

          <h3 className="font-semibold">
            {alert.title}
          </h3>

          <p className="mt-1 text-sm leading-6 text-slate-400">
            {alert.description}
          </p>

        </div>

      </div>

    </div>
  );
}

// ==========================================================
// STATUS BADGE
// ==========================================================

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const normalized =
    status.toLowerCase();

  if (normalized === "paid") {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400">

        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

        Paid

      </span>
    );
  }

  if (normalized === "failed") {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-400">

        <span className="h-1.5 w-1.5 rounded-full bg-red-400" />

        Failed

      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-400">

      <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />

      {status}

    </span>
  );
}