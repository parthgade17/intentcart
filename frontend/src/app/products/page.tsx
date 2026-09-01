
"use client";

import { useMemo, useState } from "react";

type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  rating: number;
  reviews: number;
  emoji: string;
  description: string;
};

const products: Product[] = [
  {
    id: 1,
    name: "Wireless Headphones",
    category: "Electronics",
    price: 2499,
    rating: 4.5,
    reviews: 128,
    emoji: "🎧",
    description:
      "Premium wireless headphones with immersive sound and long battery life.",
  },
  {
    id: 2,
    name: "Smart Watch",
    category: "Electronics",
    price: 3499,
    rating: 4.4,
    reviews: 96,
    emoji: "⌚",
    description:
      "Smart fitness watch with health tracking, notifications and multiple sports modes.",
  },
  {
    id: 3,
    name: "Running Shoes",
    category: "Fashion",
    price: 1999,
    rating: 4.6,
    reviews: 214,
    emoji: "👟",
    description:
      "Lightweight running shoes designed for comfort and everyday performance.",
  },
  {
    id: 4,
    name: "Laptop Backpack",
    category: "Accessories",
    price: 1299,
    rating: 4.3,
    reviews: 87,
    emoji: "🎒",
    description:
      "Water-resistant backpack with dedicated laptop compartment and multiple pockets.",
  },
  {
    id: 5,
    name: "Mechanical Keyboard",
    category: "Electronics",
    price: 2899,
    rating: 4.7,
    reviews: 156,
    emoji: "⌨️",
    description:
      "Responsive mechanical keyboard built for coding, gaming and productivity.",
  },
  {
    id: 6,
    name: "Cotton Hoodie",
    category: "Fashion",
    price: 999,
    rating: 4.2,
    reviews: 63,
    emoji: "👕",
    description:
      "Comfortable everyday hoodie made from soft premium cotton fabric.",
  },
  {
    id: 7,
    name: "Gaming Mouse",
    category: "Electronics",
    price: 1499,
    rating: 4.6,
    reviews: 189,
    emoji: "🖱️",
    description:
      "High-precision gaming mouse with programmable buttons and adjustable DPI.",
  },
  {
    id: 8,
    name: "Water Bottle",
    category: "Lifestyle",
    price: 599,
    rating: 4.4,
    reviews: 74,
    emoji: "🥤",
    description:
      "Reusable insulated bottle designed to keep your drinks cold or hot for hours.",
  },
];

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [cartCount, setCartCount] = useState(() => {
    if (typeof window === "undefined") return 0;

    try {
      const saved = JSON.parse(
        localStorage.getItem("intentcart_cart") || "[]"
      );

      return Array.isArray(saved)
        ? saved.reduce(
            (total: number, item: { quantity?: number }) =>
              total + Number(item.quantity || 0),
            0
          )
        : 0;
    } catch {
      return 0;
    }
  });

  const [favorites, setFavorites] = useState<number[]>([]);

  const categories = [
    "All",
    ...Array.from(
      new Set(products.map((product) => product.category))
    ),
  ];

  const filteredProducts = useMemo(() => {
    const searchText = search.toLowerCase().trim();

    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchText) ||
        product.category.toLowerCase().includes(searchText) ||
        product.description.toLowerCase().includes(searchText);

      const matchesCategory =
        category === "All" ||
        product.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [search, category]);

  const addToCart = (product: Product) => {
    try {
      const existingCart = JSON.parse(
        localStorage.getItem("intentcart_cart") || "[]"
      );

      const existingProduct = existingCart.find(
        (item: Product & { quantity: number }) =>
          item.id === product.id
      );

      let updatedCart;

      if (existingProduct) {
        updatedCart = existingCart.map(
          (item: Product & { quantity: number }) =>
            item.id === product.id
              ? {
                  ...item,
                  quantity: item.quantity + 1,
                }
              : item
        );
      } else {
        updatedCart = [
          ...existingCart,
          {
            ...product,
            quantity: 1,
          },
        ];
      }

      localStorage.setItem(
        "intentcart_cart",
        JSON.stringify(updatedCart)
      );

      setCartCount(
        updatedCart.reduce(
          (
            total: number,
            item: { quantity?: number }
          ) => total + Number(item.quantity || 0),
          0
        )
      );

      window.dispatchEvent(
        new Event("intentcart-cart-updated")
      );
    } catch (error) {
      console.error("Add to cart error:", error);
    }
  };

  const toggleFavorite = (id: number) => {
    setFavorites((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };

  const viewProduct = (id: number) => {
    window.location.href = `/products/${id}`;
  };

  return (
    <main className="min-h-screen bg-[#070b14] text-white">

      {/* =====================================================
          NAVBAR
      ====================================================== */}

      <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#070b14]/85 backdrop-blur-2xl">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">

          <button
            onClick={() => {
              window.location.href = "/";
            }}
            className="group flex items-center gap-3"
          >

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400 text-xl font-black text-slate-950 shadow-lg shadow-cyan-500/20 transition group-hover:scale-105">
              I
            </div>

            <div className="text-left">
              <h1 className="text-lg font-black tracking-tight">
                IntentCart
              </h1>

              <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-slate-500">
                Smart Commerce
              </p>
            </div>

          </button>

          <div className="hidden items-center gap-8 md:flex">

            <button
              onClick={() => {
                window.location.href = "/products";
              }}
              className="text-sm font-semibold text-cyan-400"
            >
              Shop
            </button>

            <button
              onClick={() => {
                window.location.href = "/dashboard";
              }}
              className="text-sm font-semibold text-slate-400 transition hover:text-white"
            >
              Orders
            </button>

          </div>

          <button
            onClick={() => {
              window.location.href = "/cart";
            }}
            className="relative flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-bold transition hover:border-cyan-400/40 hover:bg-cyan-400/10"
          >

            <span className="text-lg">
              🛒
            </span>

            <span className="hidden sm:inline">
              Cart
            </span>

            {cartCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-cyan-400 px-1.5 text-[10px] font-black text-slate-950">
                {cartCount}
              </span>
            )}

          </button>

        </div>

      </nav>

      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="relative overflow-hidden border-b border-white/10">

        <div className="absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="absolute -left-40 top-40 h-[400px] w-[400px] rounded-full bg-blue-500/5 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-5 py-20 sm:py-24 lg:py-28">

          <div className="max-w-4xl">

            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-bold text-cyan-300">

              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-400 text-slate-950">
                ✦
              </span>

              AI-powered shopping experience

            </div>

            <h2 className="text-5xl font-black leading-[0.95] tracking-[-0.04em] sm:text-6xl lg:text-7xl">

              Shop smarter.

              <br />

              <span className="bg-gradient-to-r from-cyan-300 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Buy better.
              </span>

            </h2>

            <p className="mt-7 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
              Discover products, compare options and complete
              your purchase through a fast and secure shopping
              experience powered by IntentCart.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">

              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs font-semibold text-slate-300">
                ⚡ Fast checkout
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs font-semibold text-slate-300">
                🔒 Secure payments
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs font-semibold text-slate-300">
                🤖 AI insights
              </div>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          STORE
      ====================================================== */}

      <section className="mx-auto max-w-7xl px-5 py-12 sm:py-16">

        {/* SEARCH BAR */}

        <div className="grid gap-4 lg:grid-cols-[1fr_auto]">

          <div className="relative">

            <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-xl text-slate-500">
              🔎
            </span>

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search products, categories or features..."
              className="w-full rounded-2xl border border-white/10 bg-white/[0.04] py-4 pl-14 pr-5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/40 focus:bg-white/[0.06] focus:ring-4 focus:ring-cyan-400/5"
            />

          </div>

          <div className="flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-4">

            <span className="mr-2 h-2 w-2 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50" />

            <span className="text-sm font-semibold text-slate-400">
              {filteredProducts.length} products available
            </span>

          </div>

        </div>

        {/* CATEGORY FILTERS */}

        <div className="mt-7 flex gap-2 overflow-x-auto pb-2">

          {categories.map((item) => (

            <button
              key={item}
              onClick={() => setCategory(item)}
              className={`whitespace-nowrap rounded-xl px-5 py-3 text-sm font-bold transition ${
                category === item
                  ? "bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-400/10"
                  : "border border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
              }`}
            >
              {item}
            </button>

          ))}

        </div>

        {/* SECTION HEADER */}

        <div className="mb-7 mt-12 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

          <div>

            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-cyan-400">
              Explore
            </p>

            <h3 className="mt-2 text-3xl font-black tracking-tight">
              Featured Products
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Curated products for your everyday needs.
            </p>

          </div>

          <div className="text-sm text-slate-500">
            {filteredProducts.length} result
            {filteredProducts.length !== 1 ? "s" : ""}
          </div>

        </div>

        {/* PRODUCTS */}

        {filteredProducts.length === 0 ? (

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-24 text-center">

            <div className="text-6xl">
              🔎
            </div>

            <h3 className="mt-6 text-2xl font-black">
              No products found
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Try another search term or choose a different
              category.
            </p>

            <button
              onClick={() => {
                setSearch("");
                setCategory("All");
              }}
              className="mt-7 rounded-xl bg-cyan-400 px-6 py-3 font-bold text-slate-950 transition hover:bg-cyan-300"
            >
              Clear Filters
            </button>

          </div>

        ) : (

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

            {filteredProducts.map((product) => (

              <article
                key={product.id}
                className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] transition duration-300 hover:-translate-y-1.5 hover:border-cyan-400/30 hover:bg-white/[0.055] hover:shadow-2xl hover:shadow-cyan-500/5"
              >

                {/* PRODUCT VISUAL */}

                <div className="relative">

                  <button
                    onClick={() =>
                      viewProduct(product.id)
                    }
                    className="relative flex h-64 w-full items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 to-slate-950"
                    aria-label={`View ${product.name}`}
                  >

                    <div className="absolute h-44 w-44 rounded-full bg-cyan-400/5 blur-3xl transition duration-500 group-hover:bg-cyan-400/10" />

                    <span className="relative text-8xl transition duration-500 group-hover:scale-110">
                      {product.emoji}
                    </span>

                  </button>

                  {/* CATEGORY */}

                  <span className="absolute left-4 top-4 rounded-lg border border-white/10 bg-slate-950/80 px-2.5 py-1.5 text-[9px] font-black uppercase tracking-wider text-cyan-300 backdrop-blur">
                    {product.category}
                  </span>

                  {/* FAVORITE */}

                  <button
                    onClick={() =>
                      toggleFavorite(product.id)
                    }
                    className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-slate-950/80 text-sm backdrop-blur transition hover:border-red-400/30"
                    aria-label="Add to wishlist"
                  >
                    {favorites.includes(product.id)
                      ? "❤️"
                      : "♡"}
                  </button>

                </div>

                {/* PRODUCT INFO */}

                <div className="p-5">

                  <div className="flex items-center justify-between gap-3">

                    <div className="flex items-center gap-1 text-xs font-bold text-yellow-400">
                      ⭐ {product.rating}
                    </div>

                    <span className="text-[11px] text-slate-600">
                      {product.reviews} reviews
                    </span>

                  </div>

                  <button
                    onClick={() =>
                      viewProduct(product.id)
                    }
                    className="mt-3 text-left text-lg font-black transition hover:text-cyan-400"
                  >
                    {product.name}
                  </button>

                  <p className="mt-2 min-h-[48px] text-sm leading-6 text-slate-500">
                    {product.description}
                  </p>

                  <div className="mt-5 flex items-end justify-between">

                    <div>

                      <p className="text-2xl font-black tracking-tight">
                        ₹
                        {product.price.toLocaleString(
                          "en-IN"
                        )}
                      </p>

                      <p className="mt-1 text-[10px] text-slate-600">
                        Inclusive of applicable taxes
                      </p>

                    </div>

                  </div>

                  {/* ACTIONS */}

                  <div className="mt-5 grid grid-cols-[1fr_auto] gap-2">

                    <button
                      onClick={() =>
                        addToCart(product)
                      }
                      className="rounded-xl bg-cyan-400 px-4 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-300 active:scale-[0.98]"
                    >
                      🛒 Add to Cart
                    </button>

                    <button
                      onClick={() =>
                        viewProduct(product.id)
                      }
                      className="flex w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-lg text-slate-400 transition hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:text-cyan-300"
                      aria-label={`View ${product.name}`}
                    >
                      →
                    </button>

                  </div>

                </div>

              </article>

            ))}

          </div>

        )}

      </section>

      {/* =====================================================
          TRUST SECTION
      ====================================================== */}

      <section className="border-y border-white/10 bg-white/[0.02]">

        <div className="mx-auto grid max-w-7xl gap-5 px-5 py-10 sm:grid-cols-3">

          <div className="flex items-center gap-4">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-400/10 text-xl">
              🔒
            </div>

            <div>
              <p className="text-sm font-bold">
                Secure Payments
              </p>

              <p className="mt-1 text-xs text-slate-600">
                Protected checkout powered by Razorpay
              </p>
            </div>

          </div>

          <div className="flex items-center gap-4">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-400/10 text-xl">
              ⚡
            </div>

            <div>
              <p className="text-sm font-bold">
                Fast Experience
              </p>

              <p className="mt-1 text-xs text-slate-600">
                Simple shopping from discovery to payment
              </p>
            </div>

          </div>

          <div className="flex items-center gap-4">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-400/10 text-xl">
              🤖
            </div>

            <div>
              <p className="text-sm font-bold">
                AI Powered
              </p>

              <p className="mt-1 text-xs text-slate-600">
                Intelligent insights for better decisions
              </p>
            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          FOOTER
      ====================================================== */}

      <footer className="border-t border-white/10">

        <div className="mx-auto max-w-7xl px-5 py-12">

          <div className="flex flex-col items-center justify-between gap-6 text-center sm:flex-row sm:text-left">

            <div>

              <div className="flex items-center justify-center gap-3 sm:justify-start">

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-400 text-sm font-black text-slate-950">
                  I
                </div>

                <span className="font-black">
                  IntentCart
                </span>

              </div>

              <p className="mt-2 text-xs text-slate-600">
                AI-powered commerce platform
              </p>

            </div>

            <div className="text-xs text-slate-600">
              © 2026 IntentCart. Smart shopping, simplified.
            </div>

          </div>

        </div>

      </footer>

    </main>
  );
 }
