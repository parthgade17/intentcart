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
const searchText = search.toLowerCase().trim();

return products.filter((product) => {
  const matchesSearch =
    product.name.toLowerCase().includes(searchText) ||
    product.category.toLowerCase().includes(searchText) ||
    product.description.toLowerCase().includes(searchText);

  const matchesCategory =
    category === "All" || product.category === category;

  return matchesSearch && matchesCategory;
});


}, [search, category]);

return ( <main className="min-h-screen bg-slate-950 text-white">
{/* NAVBAR */}

```
  <nav className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-xl">
    <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
      <button
        onClick={() => {
          window.location.href = "/";
        }}
        className="flex items-center gap-3"
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500 text-lg font-black text-slate-950 shadow-lg shadow-cyan-500/20">
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

      <button
        onClick={() => {
          window.location.href = "/cart";
        }}
        className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-semibold transition hover:border-cyan-500/50 hover:bg-slate-800"
      >
        <span className="text-base">🛒</span>
        <span>Cart</span>
      </button>
    </div>
  </nav>

  {/* HERO */}

  <section className="relative overflow-hidden border-b border-slate-800">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(6,182,212,0.12),transparent_35%)]" />

    <div className="relative mx-auto max-w-7xl px-5 py-16 sm:py-20">
      <div className="max-w-3xl">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3.5 py-2 text-xs font-semibold text-cyan-400">
          <span>✦</span>
          AI-powered shopping
        </div>

        <h2 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
          Shop smarter.
          <br />
          <span className="text-cyan-400">
            Buy better.
          </span>
        </h2>

        <p className="mt-5 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
          Discover products, compare options and find what you need
          with IntentCart.
        </p>

        <div className="mt-8 flex flex-wrap gap-3 text-xs text-slate-400">
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-2.5">
            ⚡ Fast checkout
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-2.5">
            🔒 Secure payments
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-2.5">
            🤖 AI insights
          </div>
        </div>
      </div>
    </div>
  </section>

  {/* STORE */}

  <section className="mx-auto max-w-7xl px-5 py-10 sm:py-12">
    {/* SEARCH */}

    <div className="mb-7 flex flex-col gap-4 lg:flex-row">
      <div className="relative flex-1">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-slate-500">
          🔎
        </span>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products, categories..."
          className="w-full rounded-2xl border border-slate-800 bg-slate-900 py-4 pl-12 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10"
        />
      </div>

      <div className="flex items-center rounded-2xl border border-slate-800 bg-slate-900 px-5 py-3 text-sm text-slate-400">
        <span className="mr-2 text-cyan-400">●</span>
        {filteredProducts.length} products available
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
              ? "bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/10"
              : "border border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700 hover:text-white"
          }`}
        >
          {item}
        </button>
      ))}
    </div>

    {/* RESULTS HEADER */}

    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
          Store
        </p>

        <h3 className="mt-1 text-2xl font-black">
          Featured Products
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          {filteredProducts.length} product
          {filteredProducts.length !== 1 ? "s" : ""} found
        </p>
      </div>
    </div>

    {/* PRODUCT GRID */}

    {filteredProducts.length === 0 ? (
      <div className="rounded-3xl border border-slate-800 bg-slate-900 px-6 py-20 text-center">
        <div className="text-6xl">🔎</div>

        <h3 className="mt-5 text-xl font-bold">
          No products found
        </h3>

        <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
          Try a different search term or choose another category.
        </p>

        <button
          onClick={() => {
            setSearch("");
            setCategory("All");
          }}
          className="mt-6 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-400"
        >
          Clear Filters
        </button>
      </div>
    ) : (
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
          />
        ))}
      </div>
    )}
  </section>

  {/* FOOTER */}

  <footer className="mt-10 border-t border-slate-800">
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

  alert(`${product.name} added to cart!`);
} catch (error) {
  console.error("Add to cart error:", error);
  alert("Unable to add product to cart.");
}

};

const viewProduct = () => {
window.location.href = `/products/${product.id}`;
};

return ( <article className="group overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 transition duration-300 hover:-translate-y-1 hover:border-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/5">
{/* IMAGE AREA */}

  <button
    onClick={viewProduct}
    aria-label={`View ${product.name}`}
    className="relative flex h-56 w-full items-center justify-center bg-slate-800/50 text-7xl transition group-hover:bg-slate-800"
  >
    <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(6,182,212,0.08),transparent_60%)] opacity-0 transition group-hover:opacity-100" />

    <span className="relative transition duration-300 group-hover:scale-110">
      {product.emoji}
    </span>

    <span className="absolute right-4 top-4 rounded-lg border border-slate-700 bg-slate-950/80 px-2 py-1 text-[10px] font-semibold text-slate-400 backdrop-blur">
      View
    </span>
  </button>

  {/* CONTENT */}

  <div className="p-5">
    <div className="mb-2 flex items-center justify-between gap-3">
      <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">
        {product.category}
      </span>

      <span className="text-xs text-slate-500">
        ⭐ {product.rating}
      </span>
    </div>

    <button
      onClick={viewProduct}
      className="text-left text-lg font-bold transition hover:text-cyan-400"
    >
      {product.name}
    </button>

    <p className="mt-2 min-h-[48px] text-sm leading-6 text-slate-500">
      {product.description}
    </p>

    <div className="mt-4 flex items-end justify-between">
      <div>
        <p className="text-2xl font-black">
          ₹{product.price.toLocaleString("en-IN")}
        </p>

        <p className="mt-1 text-[11px] text-slate-600">
          {product.reviews} customer reviews
        </p>
      </div>
    </div>

    <div className="mt-5 grid grid-cols-[1fr_auto] gap-2">
      <button
        onClick={addToCart}
        className="rounded-xl bg-cyan-500 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-400 active:scale-[0.98]"
      >
        🛒 Add to Cart
      </button>

      <button
        onClick={viewProduct}
        className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:border-slate-600 hover:bg-slate-800 hover:text-white"
        aria-label={`View details for ${product.name}`}
      >
        →
      </button>
    </div>
  </div>
</article>
);
}
