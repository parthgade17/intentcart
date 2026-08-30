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
      "Premium wireless headphones with immersive sound and long battery life. Designed for music, movies, gaming and everyday use. The comfortable design makes them suitable for extended listening sessions.",
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
      "A smart fitness watch with health tracking, notifications and multiple sports modes. Stay connected while tracking your daily activity and workouts.",
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
      "Lightweight running shoes designed for comfort and everyday performance. The breathable construction and cushioned sole make them ideal for running, walking and casual use.",
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
      "Water-resistant backpack with a dedicated laptop compartment and multiple pockets. Perfect for students, professionals and everyday travel.",
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
      "High-precision gaming mouse with programmable buttons and adjustable DPI. Designed for gaming, editing and everyday computer use.",
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
      "Reusable insulated bottle designed to keep your drinks cold or hot for hours. Durable, lightweight and suitable for school, college, work and travel.",
  },
];

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const product = useMemo(() => {
    const id = Number(params.id);

    return products.find(
      (item) => item.id === id
    );
  }, [params.id]);

  if (!product) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-5 text-white">
        <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
          <div className="text-5xl">🔍</div>

          <h1 className="mt-5 text-2xl font-bold">
            Product not found
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            The product you're looking for doesn't exist.
          </p>

          <button
            onClick={() =>
              router.push("/products")
            }
            className="mt-6 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-bold text-slate-950 hover:bg-cyan-400"
          >
            ← Back to Products
          </button>
        </div>
      </main>
    );
  }

  const addToCart = () => {
    const existingCart = JSON.parse(
      localStorage.getItem(
        "intentcart_cart"
      ) || "[]"
    );

    const existingProduct =
      existingCart.find(
        (item: Product & { quantity: number }) =>
          item.id === product.id
      );

    let updatedCart;

    if (existingProduct) {
      updatedCart = existingCart.map(
        (item: Product & {
          quantity: number;
        }) =>
          item.id === product.id
            ? {
                ...item,
                quantity:
                  item.quantity + quantity,
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

    setAdded(true);

    setTimeout(() => {
      setAdded(false);
    }, 2500);
  };

  const buyNow = () => {
    const existingCart = JSON.parse(
      localStorage.getItem(
        "intentcart_cart"
      ) || "[]"
    );

    const existingProduct =
      existingCart.find(
        (item: Product & { quantity: number }) =>
          item.id === product.id
      );

    let updatedCart;

    if (existingProduct) {
      updatedCart = existingCart.map(
        (item: Product & {
          quantity: number;
        }) =>
          item.id === product.id
            ? {
                ...item,
                quantity:
                  item.quantity + quantity,
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

    router.push("/cart");
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      {/* NAVBAR */}

      <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/95 backdrop-blur">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">

          <button
            onClick={() =>
              router.push("/products")
            }
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500 text-lg font-black text-slate-950">
              I
            </div>

            <div className="text-left">
              <h1 className="text-lg font-bold">
                IntentCart
              </h1>

              <p className="text-[10px] uppercase tracking-widest text-slate-500">
                Smart Commerce
              </p>
            </div>
          </button>

          <button
            onClick={() =>
              router.push("/cart")
            }
            className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-semibold transition hover:border-cyan-500/50 hover:bg-slate-800"
          >
            🛒
            <span>Cart</span>
          </button>

        </div>

      </nav>

      {/* PRODUCT */}

      <section className="mx-auto max-w-7xl px-5 py-10 sm:py-16">

        {/* BACK */}

        <button
          onClick={() =>
            router.push("/products")
          }
          className="mb-8 text-sm font-medium text-slate-500 transition hover:text-cyan-400"
        >
          ← Back to Products
        </button>

        <div className="grid gap-10 lg:grid-cols-2 lg:items-start">

          {/* PRODUCT IMAGE */}

          <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900">

            <div className="flex aspect-square items-center justify-center bg-slate-800/50 text-[150px] sm:text-[190px]">
              {product.emoji}
            </div>

          </div>

          {/* PRODUCT INFORMATION */}

          <div>

            <div className="mb-4 flex flex-wrap items-center gap-3">

              <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-cyan-400">
                {product.category}
              </span>

              <span className="text-sm text-slate-500">
                ⭐ {product.rating} ·{" "}
                {product.reviews} reviews
              </span>

            </div>

            <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
              {product.name}
            </h1>

            <p className="mt-6 text-base leading-8 text-slate-400">
              {product.description}
            </p>

            {/* PRICE */}

            <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-5">

              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                Price
              </p>

              <div className="mt-2 flex items-end gap-3">

                <span className="text-4xl font-black">
                  ₹
                  {product.price.toLocaleString(
                    "en-IN"
                  )}
                </span>

                <span className="mb-1 text-sm text-emerald-400">
                  In stock
                </span>

              </div>

            </div>

            {/* QUANTITY */}

            <div className="mt-6">

              <p className="mb-3 text-sm font-semibold">
                Quantity
              </p>

              <div className="flex w-fit items-center overflow-hidden rounded-xl border border-slate-700 bg-slate-900">

                <button
                  onClick={() =>
                    setQuantity(
                      Math.max(
                        1,
                        quantity - 1
                      )
                    )
                  }
                  className="flex h-11 w-11 items-center justify-center text-lg text-slate-400 transition hover:bg-slate-800 hover:text-white"
                >
                  −
                </button>

                <span className="flex h-11 w-12 items-center justify-center border-x border-slate-700 text-sm font-bold">
                  {quantity}
                </span>

                <button
                  onClick={() =>
                    setQuantity(
                      quantity + 1
                    )
                  }
                  className="flex h-11 w-11 items-center justify-center text-lg text-slate-400 transition hover:bg-slate-800 hover:text-white"
                >
                  +
                </button>

              </div>

            </div>

            {/* TOTAL */}

            <div className="mt-6 flex items-center justify-between border-t border-slate-800 pt-5">

              <span className="text-sm text-slate-500">
                Total
              </span>

              <span className="text-2xl font-black">
                ₹
                {(
                  product.price *
                  quantity
                ).toLocaleString(
                  "en-IN"
                )}
              </span>

            </div>

            {/* BUTTONS */}

            <div className="mt-6 grid gap-3 sm:grid-cols-2">

              <button
                onClick={addToCart}
                className={`rounded-xl border px-5 py-4 text-sm font-bold transition ${
                  added
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                    : "border-slate-700 bg-slate-900 text-white hover:border-cyan-500/50 hover:bg-slate-800"
                }`}
              >
                {added
                  ? "✓ Added to Cart"
                  : "🛒 Add to Cart"}
              </button>

              <button
                onClick={buyNow}
                className="rounded-xl bg-cyan-500 px-5 py-4 text-sm font-bold text-slate-950 transition hover:bg-cyan-400"
              >
                ⚡ Buy Now
              </button>

            </div>

            {/* FEATURES */}

            <div className="mt-8 grid gap-3 sm:grid-cols-3">

              <Feature
                icon="🚚"
                title="Fast Delivery"
              />

              <Feature
                icon="🔒"
                title="Secure Payment"
              />

              <Feature
                icon="↩️"
                title="Easy Returns"
              />

            </div>

          </div>

        </div>

      </section>

      {/* FOOTER */}

      <footer className="border-t border-slate-800">

        <div className="mx-auto max-w-7xl px-5 py-8 text-center">

          <p className="text-sm font-semibold">
            IntentCart
          </p>

          <p className="mt-1 text-xs text-slate-600">
            AI-powered commerce platform
          </p>

        </div>

      </footer>

    </main>
  );
}

function Feature({
  icon,
  title,
}: {
  icon: string;
  title: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 text-center">

      <div className="text-xl">
        {icon}
      </div>

      <p className="mt-2 text-xs font-semibold text-slate-300">
        {title}
      </p>

    </div>
  );
}