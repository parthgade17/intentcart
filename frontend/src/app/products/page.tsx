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

  const categories = [
    "All",
    ...Array.from(
      new Set(products.map((product) => product.category))
    ),
  ];

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const searchText = search.toLowerCase().trim();

      const matchesSearch =
        product.name.toLowerCase().includes(searchText) ||
        product.category.toLowerCase().includes(searchText) ||
        product.description
          .toLowerCase()
          .includes(searchText);

      const matchesCategory =
        category === "All" ||
        product.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [search, category]);

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      {/* NAVBAR */}

      <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/95 backdrop-blur">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500 text-lg font-black text-slate-950">
              I
            </div>

            <div>
              <h1 className="text-lg font-bold">
                IntentCart
              </h1>

              <p className="text-[10px] uppercase tracking-widest text-slate-500">
                Smart Commerce
              </p>
            </div>

          </div>

          <button
            onClick={() => {
              window.location.href = "/cart";
            }}
            className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-semibold transition hover:border-cyan-500/50 hover:bg-slate-800"
          >
            🛒
            <span>Cart</span>
          </button>

        </div>

      </nav>

      {/* HERO */}

      <section className="border-b border-slate-800">

        <div className="mx-auto max-w-7xl px-5 py-14 sm:py-20">

          <div className="max-w-3xl">

            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-400">
              ✦ AI-powered shopping
            </div>

            <h2 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
              Shop smarter.
              <br />
              <span className="text-cyan-400">
                Buy better.
              </span>
            </h2>

            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
              Discover products, compare options and find what you need with IntentCart.
            </p>

          </div>

        </div>

      </section>

      {/* STORE */}

      <section className="mx-auto max-w-7xl px-5 py-10">

        {/* SEARCH */}

        <div className="mb-8 flex flex-col gap-4 lg:flex-row">

          <div className="relative flex-1">

            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
              🔎
            </span>

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search products..."
              className="w-full rounded-2xl border border-slate-800 bg-slate-900 py-4 pl-12 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-500/50"
            />

          </div>

        </div>

        {/* CATEGORIES */}

        <div className="mb-10 flex gap-2 overflow-x-auto pb-2">

          {categories.map((item) => (

            <button
              key={item}
              onClick={() => setCategory(item)}
              className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                category === item
                  ? "bg-cyan-500 text-slate-950"
                  : "border border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700 hover:text-white"
              }`}
            >
              {item}
            </button>

          ))}

        </div>

        {/* RESULTS */}

        <div className="mb-5 flex items-center justify-between">

          <div>

            <h3 className="text-xl font-bold">
              Products
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              {filteredProducts.length} product
              {filteredProducts.length !== 1
                ? "s"
                : ""}{" "}
              found
            </p>

          </div>

        </div>

        {/* PRODUCT GRID */}

        {filteredProducts.length === 0 ? (

          <div className="rounded-2xl border border-slate-800 bg-slate-900 px-6 py-16 text-center">

            <div className="text-5xl">
              🔍
            </div>

            <h3 className="mt-5 text-xl font-bold">
              No products found
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Try a different search term or category.
            </p>

            <button
              onClick={() => {
                setSearch("");
                setCategory("All");
              }}
              className="mt-6 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-bold text-slate-950 hover:bg-cyan-400"
            >
              Clear Filters
            </button>

          </div>

        ) : (

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

            {filteredProducts.map(
              (product) => (

                <ProductCard
                  key={product.id}
                  product={product}
                />

              )
            )}

          </div>

        )}

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

// ==========================================================
// PRODUCT CARD
// ==========================================================

function ProductCard({
  product,
}: {
  product: Product;
}) {
  const addToCart = () => {
    const existingCart = JSON.parse(
      localStorage.getItem("intentcart_cart") ||
        "[]"
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
                  item.quantity + 1,
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

    alert(
      `${product.name} added to cart!`
    );
  };

  const viewProduct = () => {
    window.location.href = `/products/${product.id}`;
  };

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 transition duration-300 hover:-translate-y-1 hover:border-slate-700">

      {/* IMAGE AREA */}

      <button
        onClick={viewProduct}
        className="flex h-56 w-full items-center justify-center bg-slate-800/50 text-7xl transition group-hover:bg-slate-800"
      >
        {product.emoji}
      </button>

      {/* CONTENT */}

      <div className="p-5">

        <div className="mb-2 flex items-center justify-between">

          <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">
            {product.category}
          </span>

          <span className="text-xs text-slate-500">
            ⭐ {product.rating}
          </span>

        </div>

        <button
          onClick={viewProduct}
          className="text-left"
        >
          <h3 className="text-lg font-bold transition hover:text-cyan-400">
            {product.name}
          </h3>
        </button>

        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
          {product.description}
        </p>

        <div className="mt-2 text-xs text-slate-600">
          {product.reviews} reviews
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">

          <div>

            <p className="text-xl font-black">
              ₹
              {product.price.toLocaleString(
                "en-IN"
              )}
            </p>

          </div>

          <button
            onClick={addToCart}
            className="rounded-xl bg-cyan-500 px-4 py-2.5 text-xs font-bold text-slate-950 transition hover:bg-cyan-400"
          >
            Add to Cart
          </button>

        </div>

      </div>

    </article>
  );
}