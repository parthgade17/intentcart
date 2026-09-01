
"use client";

import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      {/* ======================================================
          NAVBAR
      ====================================================== */}

      <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur-xl">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">

          {/* LOGO */}

          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-3"
          >

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400 text-xl font-black text-slate-950 shadow-lg shadow-cyan-500/20">
              I
            </div>

            <div className="text-left">
              <p className="text-lg font-black tracking-tight">
                IntentCart
              </p>

              <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                Smart Commerce
              </p>
            </div>

          </button>

          {/* NAVIGATION */}

          <div className="hidden items-center gap-8 md:flex">

            <button
              onClick={() => router.push("/")}
              className="text-sm font-semibold text-white"
            >
              Home
            </button>

            <button
              onClick={() => router.push("/products")}
              className="text-sm font-semibold text-slate-400 transition hover:text-cyan-400"
            >
              Products
            </button>

            <button
              onClick={() => router.push("/cart")}
              className="text-sm font-semibold text-slate-400 transition hover:text-cyan-400"
            >
              Cart
            </button>

          </div>

          {/* CART BUTTON */}

          <button
            onClick={() => router.push("/cart")}
            className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-bold transition hover:border-cyan-500/50 hover:bg-slate-800"
          >
            🛒 Cart
          </button>

        </div>

      </nav>

      {/* ======================================================
          HERO SECTION
      ====================================================== */}

      <section className="relative overflow-hidden">

        {/* Background glow */}

        <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl gap-12 px-5 py-20 md:grid-cols-2 md:items-center md:py-28">

          {/* HERO CONTENT */}

          <div>

            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-xs font-bold text-cyan-400">
              ✨ AI-Powered Shopping
            </div>

            <h1 className="max-w-3xl text-5xl font-black leading-tight tracking-tight sm:text-6xl">

              Shopping that

              <span className="block text-cyan-400">
                understands you.
              </span>

            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-slate-400 sm:text-lg">
              Discover products, manage your cart, and complete
              secure payments through a smarter shopping experience
              powered by IntentCart.
            </p>

            {/* HERO BUTTONS */}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">

              <button
                onClick={() => router.push("/products")}
                className="rounded-xl bg-cyan-400 px-7 py-4 text-sm font-black text-slate-950 shadow-lg shadow-cyan-500/10 transition hover:bg-cyan-300"
              >
                🛍️ Explore Products
              </button>

              <button
                onClick={() => router.push("/cart")}
                className="rounded-xl border border-slate-700 bg-slate-900 px-7 py-4 text-sm font-bold text-slate-200 transition hover:border-cyan-500/40 hover:bg-slate-800"
              >
                View Cart →
              </button>

            </div>

            {/* TRUST */}

            <div className="mt-10 flex flex-wrap gap-6 text-xs text-slate-500">

              <div className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span>
                Secure Payments
              </div>

              <div className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span>
                Smart Shopping
              </div>

              <div className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span>
                Fast Checkout
              </div>

            </div>

          </div>

          {/* HERO VISUAL */}

          <div className="relative">

            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-2xl shadow-cyan-950/20">

              {/* MOCK STORE HEADER */}

              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">

                <div className="flex items-center justify-between">

                  <div>
                    <p className="text-xs text-slate-500">
                      Welcome back
                    </p>

                    <p className="mt-1 font-bold">
                      Smart Shopping
                    </p>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-lg">
                    ✦
                  </div>

                </div>

                {/* PRODUCT CARDS */}

                <div className="mt-6 grid grid-cols-2 gap-3">

                  <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">

                    <div className="flex h-24 items-center justify-center rounded-xl bg-slate-800 text-5xl">
                      🎧
                    </div>

                    <p className="mt-3 text-sm font-bold">
                      Wireless Audio
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      ₹2,499
                    </p>

                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">

                    <div className="flex h-24 items-center justify-center rounded-xl bg-slate-800 text-5xl">
                      ⌚
                    </div>

                    <p className="mt-3 text-sm font-bold">
                      Smart Watch
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      ₹3,499
                    </p>

                  </div>

                </div>

                {/* AI RECOMMENDATION */}

                <div className="mt-4 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4">

                  <div className="flex items-start gap-3">

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
                      ✦
                    </div>

                    <div>

                      <p className="text-xs font-bold text-cyan-400">
                        IntentCart AI
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-400">
                        Based on your shopping intent, these
                        products may be a great match.
                      </p>

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* ======================================================
          FEATURES
      ====================================================== */}

      <section className="border-y border-slate-800 bg-slate-900/30">

        <div className="mx-auto max-w-7xl px-5 py-16">

          <div className="max-w-2xl">

            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
              Why IntentCart
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              A smarter way to shop.
            </h2>

            <p className="mt-4 text-sm leading-6 text-slate-500">
              IntentCart combines a clean shopping experience with
              intelligent features to make discovering and purchasing
              products easier.
            </p>

          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">

            {/* FEATURE 1 */}

            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 transition hover:-translate-y-1 hover:border-cyan-500/30">

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 text-2xl">
                🤖
              </div>

              <h3 className="mt-5 text-lg font-bold">
                AI-Powered Insights
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Intelligent insights help understand shopping
                activity and purchasing patterns.
              </p>

            </div>

            {/* FEATURE 2 */}

            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 transition hover:-translate-y-1 hover:border-cyan-500/30">

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-2xl">
                🔒
              </div>

              <h3 className="mt-5 text-lg font-bold">
                Secure Payments
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Payments are processed securely through Razorpay
                with server-side verification.
              </p>

            </div>

            {/* FEATURE 3 */}

            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 transition hover:-translate-y-1 hover:border-cyan-500/30">

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-2xl">
                📊
              </div>

              <h3 className="mt-5 text-lg font-bold">
                Smart Commerce
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Orders, transactions, and commerce activity are
                organized into one intelligent platform.
              </p>

            </div>

          </div>

        </div>

      </section>

      {/* ======================================================
          SHOPPING CTA
      ====================================================== */}

      <section className="mx-auto max-w-7xl px-5 py-20">

        <div className="overflow-hidden rounded-3xl border border-cyan-500/20 bg-cyan-500/5 p-8 sm:p-12">

          <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">

            <div>

              <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
                Ready to shop?
              </p>

              <h2 className="mt-3 text-3xl font-black">
                Find something you'll love.
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">
                Explore our products and experience the IntentCart
                shopping interface.
              </p>

            </div>

            <button
              onClick={() => router.push("/products")}
              className="shrink-0 rounded-xl bg-cyan-400 px-7 py-4 text-sm font-black text-slate-950 transition hover:bg-cyan-300"
            >
              Start Shopping →
            </button>

          </div>

        </div>

      </section>

      {/* ======================================================
          FOOTER
      ====================================================== */}

      <footer className="border-t border-slate-800">

        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-8 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">

          <div>

            <p className="font-bold">
              IntentCart
            </p>

            <p className="mt-1 text-xs text-slate-600">
              AI-powered commerce platform
            </p>

          </div>

          <p className="text-xs text-slate-600">
            © 2026 IntentCart. All rights reserved.
          </p>

        </div>

      </footer>

    </main>
  );
}
