"use client";

import { useParams, useRouter } from "next/navigation";
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

type CartItem = Product & {
  quantity: number;
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
      "Premium wireless headphones with immersive sound and long battery life. Designed for music, movies, gaming and everyday use.",
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
      "A smart fitness watch with health tracking, notifications and multiple sports modes. Stay connected while tracking your daily activity.",
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
      "Lightweight running shoes designed for comfort and everyday performance. Ideal for running, walking and casual use.",
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
      "Water-resistant backpack with a dedicated laptop compartment and multiple pockets. Perfect for students and professionals.",
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
      "Responsive mechanical keyboard built for coding, gaming and productivity. Enjoy precise keystrokes and a satisfying typing experience.",
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
      "Comfortable everyday hoodie made from soft premium cotton fabric. A simple and versatile choice for casual wear.",
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
      "High-precision gaming mouse with programmable buttons and adjustable DPI. Designed for gaming, editing and everyday use.",
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
      "Reusable insulated bottle designed to keep your drinks cold or hot for hours. Durable, lightweight and suitable for travel.",
  },
];

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [buying, setBuying] = useState(false);
  const [wishlist, setWishlist] = useState(false);

  const product = useMemo(() => {
    const id = Number(params.id);

    return products.find((item) => item.id === id);
  }, [params.id]);

  if (!product) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-5 text-white">
        <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center shadow-2xl">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-800 text-4xl">
            🔍
          </div>

          <h1 className="mt-6 text-2xl font-black">
            Product not found
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            The product you're looking for doesn't exist or may have
            been removed.
          </p>

          <button
            onClick={() => router.push("/products")}
            className="mt-7 rounded-xl bg-cyan-500 px-6 py-3.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-400"
          >
            ← Back to Products
          </button>
        </div>
      </main>
    );
  }

  const addProductToCart = () => {
    try {
      const savedCart =
        localStorage.getItem("intentcart_cart");

      const existingCart: CartItem[] = savedCart
        ? JSON.parse(savedCart)
        : [];

      const existingProduct = existingCart.find(
        (item) => item.id === product.id
      );

      let updatedCart: CartItem[];

      if (existingProduct) {
        updatedCart = existingCart.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity:
                  Number(item.quantity) + quantity,
              }
            : item
        );
      } else {
        updatedCart = [
          ...existingCart,
          {
            ...product,
            quantity,
          },
        ];
      }

      localStorage.setItem(
        "intentcart_cart",
        JSON.stringify(updatedCart)
      );

      return true;
    } catch (error) {
      console.error("Add to cart error:", error);
      return false;
    }
  };

  const handleAddToCart = () => {
    const success = addProductToCart();

    if (!success) {
      return;
    }

    setAdded(true);

    setTimeout(() => {
      setAdded(false);
    }, 2500);
  };

  const handleBuyNow = () => {
    if (buying) {
      return;
    }

    setBuying(true);

    const success = addProductToCart();

    if (!success) {
      setBuying(false);
      return;
    }

    router.push("/cart");
  };

  const total = product.price * quantity;

  const relatedProducts = products
    .filter(
      (item) =>
        item.category === product.category &&
        item.id !== product.id
    )
    .slice(0, 3);

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <nav className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-xl">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">

          <button
            onClick={() => router.push("/products")}
            className="group flex items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500 text-lg font-black text-slate-950 shadow-lg shadow-cyan-500/20 transition group-hover:scale-105">
              I
            </div>

            <div className="text-left">
              <h1 className="text-lg font-bold tracking-tight">
                IntentCart
              </h1>

              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                Smart Commerce
              </p>
            </div>
          </button>

          <div className="flex items-center gap-2">

            <button
              onClick={() =>
                setWishlist(!wishlist)
              }
              aria-label="Wishlist"
              className={`flex h-11 w-11 items-center justify-center rounded-xl border text-lg transition ${
                wishlist
                  ? "border-red-500/30 bg-red-500/10 text-red-400"
                  : "border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-600 hover:text-white"
              }`}
            >
              {wishlist ? "♥" : "♡"}
            </button>

            <button
              onClick={() => router.push("/cart")}
              className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-semibold transition hover:border-cyan-500/50 hover:bg-slate-800"
            >
              <span>🛒</span>
              <span className="hidden sm:inline">
                Cart
              </span>
            </button>

          </div>

        </div>

      </nav>

      {/* =====================================================
          BREADCRUMB
      ===================================================== */}

      <section className="mx-auto max-w-7xl px-5 pt-7">

        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">

          <button
            onClick={() => router.push("/products")}
            className="transition hover:text-cyan-400"
          >
            Products
          </button>

          <span>/</span>

          <span>{product.category}</span>

          <span>/</span>

          <span className="text-slate-400">
            {product.name}
          </span>

        </div>

      </section>

      {/* =====================================================
          PRODUCT
      ===================================================== */}

      <section className="mx-auto max-w-7xl px-5 py-8 sm:py-12">

        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">

          {/* =================================================
              LEFT PRODUCT SHOWCASE
          ================================================= */}

          <div>

            <div className="group relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl">

              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.12),transparent_55%)]" />

              <div className="absolute left-5 top-5 z-10 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-cyan-400">
                {product.category}
              </div>

              <button
                onClick={() =>
                  setWishlist(!wishlist)
                }
                className={`absolute right-5 top-5 z-10 flex h-11 w-11 items-center justify-center rounded-xl border backdrop-blur transition ${
                  wishlist
                    ? "border-red-500/30 bg-red-500/10 text-red-400"
                    : "border-slate-700 bg-slate-950/70 text-slate-400 hover:text-white"
                }`}
              >
                {wishlist ? "♥" : "♡"}
              </button>

              <div className="relative flex aspect-square items-center justify-center overflow-hidden">

                <div className="absolute h-64 w-64 rounded-full bg-cyan-500/5 blur-3xl" />

                <span className="relative text-[130px] transition duration-500 group-hover:scale-110 sm:text-[180px] lg:text-[210px]">
                  {product.emoji}
                </span>

              </div>

              <div className="border-t border-slate-800 bg-slate-950/50 px-5 py-4">

                <div className="flex items-center justify-between">

                  <div>
                    <p className="text-xs font-semibold text-slate-400">
                      IntentCart verified
                    </p>

                    <p className="mt-1 text-[11px] text-slate-600">
                      Quality checked product listing
                    </p>
                  </div>

                  <div className="flex items-center gap-1 rounded-lg bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-400">
                    ✓ In Stock
                  </div>

                </div>

              </div>

            </div>

            {/* TRUST CARDS */}

            <div className="mt-4 grid grid-cols-3 gap-3">

              <TrustCard
                icon="🚚"
                title="Fast Delivery"
                text="Quick dispatch"
              />

              <TrustCard
                icon="🔒"
                title="Secure"
                text="Protected payment"
              />

              <TrustCard
                icon="↩️"
                title="Easy Returns"
                text="Simple returns"
              />

            </div>

          </div>

          {/* =================================================
              RIGHT INFORMATION
          ================================================= */}

          <div className="flex flex-col">

            <div className="flex items-center gap-3">

              <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-cyan-400">
                Featured
              </span>

              <span className="text-xs text-slate-600">
                Product #{product.id}
              </span>

            </div>

            <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-5xl">
              {product.name}
            </h1>

            {/* RATING */}

            <div className="mt-5 flex flex-wrap items-center gap-4">

              <div className="flex items-center gap-2">

                <span className="rounded-lg bg-amber-500/10 px-2.5 py-1.5 text-sm font-bold text-amber-400">
                  ⭐ {product.rating}
                </span>

                <span className="text-sm text-slate-500">
                  {product.reviews} reviews
                </span>

              </div>

              <span className="hidden text-slate-700 sm:inline">
                •
              </span>

              <span className="text-sm text-emerald-400">
                ✓ Available now
              </span>

            </div>

            {/* DESCRIPTION */}

            <p className="mt-7 text-base leading-8 text-slate-400">
              {product.description}
            </p>

            {/* PRICE */}

            <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">

              <p className="text-xs font-bold uppercase tracking-widest text-slate-600">
                Current Price
              </p>

              <div className="mt-2 flex flex-wrap items-end gap-3">

                <span className="text-4xl font-black tracking-tight">
                  ₹
                  {product.price.toLocaleString(
                    "en-IN"
                  )}
                </span>

                <span className="mb-1 rounded-lg bg-emerald-500/10 px-2 py-1 text-xs font-bold text-emerald-400">
                  Best value
                </span>

              </div>

              <p className="mt-2 text-xs text-slate-600">
                Inclusive of applicable taxes
              </p>

            </div>

            {/* QUANTITY */}

            <div className="mt-7">

              <div className="mb-3 flex items-center justify-between">

                <p className="text-sm font-bold">
                  Quantity
                </p>

                <p className="text-xs text-slate-600">
                  Select how many you need
                </p>

              </div>

              <div className="flex w-fit items-center overflow-hidden rounded-xl border border-slate-700 bg-slate-900">

                <button
                  onClick={() =>
                    setQuantity(
                      Math.max(1, quantity - 1)
                    )
                  }
                  disabled={buying}
                  className="flex h-12 w-12 items-center justify-center text-xl text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:opacity-50"
                >
                  −
                </button>

                <span className="flex h-12 w-14 items-center justify-center border-x border-slate-700 text-sm font-bold">
                  {quantity}
                </span>

                <button
                  onClick={() =>
                    setQuantity(quantity + 1)
                  }
                  disabled={buying}
                  className="flex h-12 w-12 items-center justify-center text-xl text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:opacity-50"
                >
                  +
                </button>

              </div>

            </div>

            {/* TOTAL */}

            <div className="mt-7 flex items-center justify-between border-t border-slate-800 pt-5">

              <div>
                <p className="text-sm text-slate-500">
                  Your total
                </p>

                <p className="mt-1 text-xs text-slate-600">
                  {quantity} × ₹
                  {product.price.toLocaleString(
                    "en-IN"
                  )}
                </p>
              </div>

              <p className="text-3xl font-black">
                ₹
                {total.toLocaleString(
                  "en-IN"
                )}
              </p>

            </div>

            {/* ACTIONS */}

            <div className="mt-6 grid gap-3 sm:grid-cols-2">

              <button
                onClick={handleAddToCart}
                disabled={buying}
                className={`rounded-xl border px-5 py-4 text-sm font-bold transition ${
                  added
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                    : "border-slate-700 bg-slate-900 text-white hover:border-cyan-500/50 hover:bg-slate-800"
                } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                {added
                  ? "✓ Added to Cart"
                  : "🛒 Add to Cart"}
              </button>

              <button
                onClick={handleBuyNow}
                disabled={buying}
                className="rounded-xl bg-cyan-500 px-5 py-4 text-sm font-black text-slate-950 shadow-lg shadow-cyan-500/10 transition hover:-translate-y-0.5 hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {buying
                  ? "Opening Cart..."
                  : "⚡ Buy Now"}
              </button>

            </div>

            {/* CHECKOUT NOTICE */}

            <div className="mt-5 flex gap-3 rounded-xl border border-cyan-500/10 bg-cyan-500/5 p-4">

              <span className="text-lg">
                🔐
              </span>

              <div>

                <p className="text-xs font-bold text-slate-300">
                  Secure checkout
                </p>

                <p className="mt-1 text-[11px] leading-5 text-slate-600">
                  Payments are securely processed through
                  Razorpay. Your payment details are protected.
                </p>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          PRODUCT HIGHLIGHTS
      ===================================================== */}

      <section className="border-y border-slate-800 bg-slate-950/60">

        <div className="mx-auto max-w-7xl px-5 py-12">

          <div className="mb-8">

            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
              Why you'll like it
            </p>

            <h2 className="mt-2 text-2xl font-black">
              Product Highlights
            </h2>

          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <HighlightCard
              icon="✨"
              title="Quality Design"
              text="Built with comfort, reliability and everyday usability in mind."
            />

            <HighlightCard
              icon="⚡"
              title="Easy to Use"
              text="Simple design that fits naturally into your daily routine."
            />

            <HighlightCard
              icon="🛡️"
              title="Reliable Choice"
              text="Highly rated by customers who have purchased this product."
            />

            <HighlightCard
              icon="🤖"
              title="Smart Commerce"
              text="Part of the AI-powered IntentCart shopping experience."
            />

          </div>

        </div>

      </section>

      {/* =====================================================
          RELATED PRODUCTS
      ===================================================== */}

      {relatedProducts.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 py-12">

          <div className="mb-7 flex items-end justify-between gap-4">

            <div>

              <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
                You may also like
              </p>

              <h2 className="mt-2 text-2xl font-black">
                Related Products
              </h2>

            </div>

            <button
              onClick={() => router.push("/products")}
              className="text-xs font-semibold text-slate-500 transition hover:text-cyan-400"
            >
              View all →
            </button>

          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

            {relatedProducts.map((item) => (

              <button
                key={item.id}
                onClick={() =>
                  router.push(
                    `/products/${item.id}`
                  )
                }
                className="group overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 text-left transition duration-300 hover:-translate-y-1 hover:border-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/5"
              >

                <div className="flex h-48 items-center justify-center bg-slate-800/50 text-7xl transition group-hover:bg-slate-800">

                  <span className="transition duration-300 group-hover:scale-110">
                    {item.emoji}
                  </span>

                </div>

                <div className="p-5">

                  <p className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">
                    {item.category}
                  </p>

                  <h3 className="mt-2 text-lg font-bold transition group-hover:text-cyan-400">
                    {item.name}
                  </h3>

                  <div className="mt-4 flex items-center justify-between">

                    <span className="text-xl font-black">
                      ₹
                      {item.price.toLocaleString(
                        "en-IN"
                      )}
                    </span>

                    <span className="text-xs text-slate-500">
                      ⭐ {item.rating}
                    </span>

                  </div>

                </div>

              </button>

            ))}

          </div>

        </section>
      )}

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="border-t border-slate-800">

        <div className="mx-auto max-w-7xl px-5 py-10 text-center">

          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500 text-sm font-black text-slate-950">
            I
          </div>

          <p className="mt-3 text-sm font-semibold">
            IntentCart
          </p>

          <p className="mt-1 text-xs text-slate-600">
            AI-powered commerce platform
          </p>

          <div className="mt-4 text-[11px] text-slate-700">
            Secure • Smart • Simple
          </div>

        </div>

      </footer>

    </main>
  );
}

// ==========================================================
// TRUST CARD
// ==========================================================

function TrustCard({
  icon,
  title,
  text,
}: {
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 text-center">

      <div className="text-xl">
        {icon}
      </div>

      <p className="mt-2 text-xs font-bold text-slate-300">
        {title}
      </p>

      <p className="mt-1 text-[10px] text-slate-600">
        {text}
      </p>

    </div>
  );
}

// ==========================================================
// HIGHLIGHT CARD
// ==========================================================

function HighlightCard({
  icon,
  title,
  text,
}: {
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 transition hover:border-slate-700">

      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-800 text-xl">
        {icon}
      </div>

      <h3 className="mt-4 text-sm font-bold">
        {title}
      </h3>

      <p className="mt-2 text-xs leading-5 text-slate-500">
        {text}
      </p>

    </div>
  );
}