
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    Razorpay: any;
  }
}

type CartItem = {
  id: number;
  name: string;
  category: string;
  price: number;
  rating: number;
  reviews: number;
  emoji: string;
  description: string;
  quantity: number;
};

type RazorpayResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

export default function CartPage() {
  const router = useRouter();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // ==========================================
  // LOAD CART
  // ==========================================

  useEffect(() => {
    try {
      const savedCart =
        localStorage.getItem("intentcart_cart");

      if (!savedCart) {
        setCart([]);
        setLoaded(true);
        return;
      }

      const parsed = JSON.parse(savedCart);

      if (Array.isArray(parsed)) {
        setCart(parsed);
      } else {
        setCart([]);
      }
    } catch (error) {
      console.error("Cart loading error:", error);
      setCart([]);
    }

    setLoaded(true);
  }, []);

  // ==========================================
  // SAVE CART
  // ==========================================

  const saveCart = (updatedCart: CartItem[]) => {
    setCart(updatedCart);

    localStorage.setItem(
      "intentcart_cart",
      JSON.stringify(updatedCart)
    );
  };

  // ==========================================
  // UPDATE QUANTITY
  // ==========================================

  const updateQuantity = (
    productId: number,
    quantity: number
  ) => {
    if (loading) return;

    if (quantity <= 0) {
      removeItem(productId);
      return;
    }

    const updatedCart = cart.map((item) =>
      item.id === productId
        ? {
            ...item,
            quantity,
          }
        : item
    );

    saveCart(updatedCart);
  };

  // ==========================================
  // REMOVE ITEM
  // ==========================================

  const removeItem = (productId: number) => {
    if (loading) return;

    const updatedCart = cart.filter(
      (item) => item.id !== productId
    );

    saveCart(updatedCart);
  };

  // ==========================================
  // CLEAR CART
  // ==========================================

  const clearCart = () => {
    if (loading) return;

    setCart([]);

    localStorage.removeItem(
      "intentcart_cart"
    );
  };

  // ==========================================
  // TOTAL ITEMS
  // ==========================================

  const totalItems = useMemo(() => {
    return cart.reduce(
      (total, item) =>
        total + Number(item.quantity),
      0
    );
  }, [cart]);

  // ==========================================
  // SUBTOTAL
  // ==========================================

  const subtotal = useMemo(() => {
    return cart.reduce(
      (total, item) =>
        total +
        Number(item.price) *
          Number(item.quantity),
      0
    );
  }, [cart]);

  // ==========================================
  // DELIVERY
  // ==========================================

  const delivery =
    subtotal >= 1000 ? 0 : 49;

  // ==========================================
  // TOTAL
  // ==========================================

  const total = subtotal + delivery;

  // ==========================================
  // LOAD RAZORPAY
  // ==========================================

  const loadRazorpay = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window === "undefined") {
        resolve(false);
        return;
      }

      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const scriptId =
        "razorpay-checkout-script";

      const existingScript =
        document.getElementById(scriptId);

      if (existingScript) {
        existingScript.addEventListener(
          "load",
          () => resolve(true)
        );

        existingScript.addEventListener(
          "error",
          () => resolve(false)
        );

        return;
      }

      const script =
        document.createElement("script");

      script.id = scriptId;

      script.src =
        "https://checkout.razorpay.com/v1/checkout.js";

      script.async = true;

      script.onload = () =>
        resolve(true);

      script.onerror = () =>
        resolve(false);

      document.body.appendChild(script);
    });
  };

  // ==========================================
  // CHECKOUT
  // ==========================================

  const handleCheckout = async () => {
    if (cart.length === 0) {
      setMessage(
        "Your cart is empty."
      );
      return;
    }

    if (loading) return;

    setLoading(true);
    setMessage("");

    try {
      // ========================================
      // RAZORPAY KEY
      // ========================================

      const razorpayKey =
        process.env
          .NEXT_PUBLIC_RAZORPAY_KEY_ID;

      if (!razorpayKey) {
        throw new Error(
          "Razorpay key is missing. Check frontend/.env.local."
        );
      }

      // ========================================
      // LOAD RAZORPAY
      // ========================================

      setMessage(
        "Loading secure payment..."
      );

      const razorpayLoaded =
        await loadRazorpay();

      if (!razorpayLoaded) {
        throw new Error(
          "Failed to load Razorpay. Please check your internet connection."
        );
      }

      // ========================================
      // PREPARE ITEMS
      // ========================================

      const orderItems = cart.map(
        (item) => ({
          id: Number(item.id),
          name: String(item.name),
          category: String(
            item.category || ""
          ),
          price: Number(item.price),
          quantity: Number(
            item.quantity
          ),
          emoji: String(
            item.emoji || ""
          ),
        })
      );

      // ========================================
      // CREATE ORDER
      // ========================================

      setMessage(
        "Creating your order..."
      );

      const orderResponse =
        await fetch(
          "http://localhost:5000/api/create-order",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              amount: total,
              items: orderItems,
            }),
          }
        );

      let orderData: any;

      try {
        orderData =
          await orderResponse.json();
      } catch {
        throw new Error(
          "Backend returned an invalid response."
        );
      }

      console.log(
        "CREATE ORDER RESPONSE:",
        orderData
      );

      if (
        !orderResponse.ok ||
        !orderData.success ||
        !orderData.order
      ) {
        throw new Error(
          orderData?.error ||
            orderData?.message ||
            "Failed to create order."
        );
      }

      // ========================================
      // IMPORTANT
      // DATABASE ORDER ID
      // ========================================

      const databaseOrderId =
        orderData.order.id;

      console.log(
        "DATABASE ORDER ID:",
        databaseOrderId
      );

      if (!databaseOrderId) {
        throw new Error(
          "Backend did not return the database order ID."
        );
      }

      // ========================================
      // RAZORPAY OPTIONS
      // ========================================

      const options = {
        key: razorpayKey,

        amount:
          orderData.order.amount,

        currency:
          orderData.order.currency ||
          "INR",

        name: "IntentCart",

        description:
          "IntentCart Shopping Order",

        order_id:
          orderData.order
            .razorpay_order_id,

        theme: {
          color: "#06b6d4",
        },

        handler:
          async function (
            response: RazorpayResponse
          ) {
            try {
              setMessage(
                "Payment successful. Verifying payment..."
              );

              console.log(
                "RAZORPAY RESPONSE:",
                response
              );

              // ==================================
              // VERIFY PAYMENT
              // ==================================

              const verifyResponse =
                await fetch(
                  "http://localhost:5000/api/verify-payment",
                  {
                    method: "POST",

                    headers: {
                      "Content-Type":
                        "application/json",
                    },

                    body: JSON.stringify({
                      razorpay_order_id:
                        response.razorpay_order_id,

                      razorpay_payment_id:
                        response.razorpay_payment_id,

                      razorpay_signature:
                        response.razorpay_signature,
                    }),
                  }
                );

              let verifyData: any;

              try {
                verifyData =
                  await verifyResponse.json();
              } catch {
                throw new Error(
                  "Invalid response from payment verification server."
                );
              }

              console.log(
                "VERIFY PAYMENT RESPONSE:",
                verifyData
              );

              if (
                !verifyResponse.ok ||
                !verifyData.success
              ) {
                throw new Error(
                  verifyData?.error ||
                    verifyData?.message ||
                    "Payment verification failed."
                );
              }

              // ==================================
              // GET FINAL DATABASE ORDER ID
              // ==================================

              const finalOrderId =
                verifyData?.order?.id ||
                databaseOrderId;

              console.log(
                "FINAL DATABASE ORDER ID:",
                finalOrderId
              );

              if (!finalOrderId) {
                throw new Error(
                  "Payment succeeded but database order ID was not returned."
                );
              }

              // ==================================
              // PURCHASED ITEMS
              // ==================================

              const purchasedItems =
                Array.isArray(
                  verifyData.items
                )
                  ? verifyData.items
                  : orderItems;

              // ==================================
              // SAVE PAYMENT DETAILS
              // ==================================

              const paymentDetails = {
                databaseOrderId:
                  Number(finalOrderId),

                razorpayOrderId:
                  response.razorpay_order_id,

                razorpayPaymentId:
                  response.razorpay_payment_id,

                amount:
                  Number(
                    verifyData?.order
                      ?.amount ||
                      orderData.order.amount
                  ),

                currency:
                  verifyData?.order
                    ?.currency ||
                  orderData.order.currency ||
                  "INR",

                status:
                  verifyData?.order
                    ?.status ||
                  "paid",

                items:
                  purchasedItems,

                paidAt:
                  new Date().toISOString(),
              };

              localStorage.setItem(
                "intentcart_last_payment",
                JSON.stringify(
                  paymentDetails
                )
              );

              console.log(
                "PAYMENT SAVED:",
                paymentDetails
              );

              // ==================================
              // CLEAR CART
              // ==================================

              localStorage.removeItem(
                "intentcart_cart"
              );

              setCart([]);

              setMessage(
                "Payment successful! Your order has been confirmed."
              );

              // ==================================
              // REDIRECT WITH ORDER ID
              // ==================================

              setTimeout(() => {
                router.push(
                  `/payment-success?id=${finalOrderId}`
                );
              }, 700);
            } catch (error) {
              console.error(
                "Payment verification error:",
                error
              );

              setLoading(false);

              setMessage(
                error instanceof Error
                  ? error.message
                  : "Payment verification failed."
              );
            }
          },

        modal: {
          ondismiss: () => {
            setLoading(false);

            setMessage(
              "Payment cancelled."
            );
          },
        },
      };

      // ========================================
      // OPEN RAZORPAY
      // ========================================

      const razorpay =
        new window.Razorpay(
          options
        );

      razorpay.on(
        "payment.failed",
        (response: any) => {
          console.error(
            "Payment failed:",
            response
          );

          setLoading(false);

          setMessage(
            response?.error
              ?.description ||
              "Payment failed. Please try again."
          );
        }
      );

      razorpay.open();
    } catch (error) {
      console.error(
        "Checkout error:",
        error
      );

      setLoading(false);

      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong during checkout."
      );
    }
  };

  // ==========================================
  // LOADING SCREEN
  // ==========================================

  if (!loaded) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <p className="text-sm text-slate-500">
          Loading cart...
        </p>
      </main>
    );
  }

  // ==========================================
  // PAGE
  // ==========================================

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
              router.push("/products")
            }
            className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-semibold hover:border-cyan-500/50 hover:bg-slate-800"
          >
            🛍️ Continue Shopping
          </button>

        </div>

      </nav>

      {/* CONTENT */}

      <section className="mx-auto max-w-7xl px-5 py-10 sm:py-14">

        <div className="mb-10">

          <p className="text-xs font-bold uppercase tracking-widest text-cyan-400">
            Your Shopping Cart
          </p>

          <h1 className="mt-2 text-4xl font-black tracking-tight">
            Cart
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            {totalItems}{" "}
            {totalItems === 1
              ? "item"
              : "items"}{" "}
            in your cart
          </p>

        </div>

        {/* MESSAGE */}

        {message && (
          <div className="mb-6 rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-4 text-sm text-cyan-400">
            {message}
          </div>
        )}

        {/* EMPTY CART */}

        {cart.length === 0 ? (
          <div className="rounded-3xl border border-slate-800 bg-slate-900 px-6 py-20 text-center">

            <div className="text-7xl">
              🛒
            </div>

            <h2 className="mt-6 text-2xl font-bold">
              Your cart is empty
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Looks like you haven't added
              anything to your cart yet.
              Discover something you'll love.
            </p>

            <button
              onClick={() =>
                router.push("/products")
              }
              className="mt-7 rounded-xl bg-cyan-500 px-6 py-3.5 text-sm font-bold text-slate-950 hover:bg-cyan-400"
            >
              🛍️ Browse Products
            </button>

          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_380px]">

            {/* CART ITEMS */}

            <div className="space-y-4">

              <div className="flex items-center justify-between">

                <h2 className="text-lg font-bold">
                  Cart Items
                </h2>

                <button
                  onClick={clearCart}
                  disabled={loading}
                  className="text-xs font-semibold text-red-400 hover:text-red-300 disabled:opacity-50"
                >
                  Clear Cart
                </button>

              </div>

              {cart.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900 p-5"
                >

                  <div className="flex gap-5">

                    {/* ICON */}

                    <button
                      onClick={() =>
                        router.push(
                          `/products/${item.id}`
                        )
                      }
                      className="flex h-28 w-28 shrink-0 items-center justify-center rounded-2xl bg-slate-800 text-5xl hover:bg-slate-700"
                    >
                      {item.emoji}
                    </button>

                    {/* INFO */}

                    <div className="min-w-0 flex-1">

                      <div className="flex items-start justify-between gap-4">

                        <div>

                          <p className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">
                            {item.category}
                          </p>

                          <button
                            onClick={() =>
                              router.push(
                                `/products/${item.id}`
                              )
                            }
                            className="mt-1 text-left text-lg font-bold hover:text-cyan-400"
                          >
                            {item.name}
                          </button>

                          <p className="mt-1 text-xs text-slate-500">
                            ⭐ {item.rating} ·{" "}
                            {item.reviews} reviews
                          </p>

                        </div>

                        <button
                          onClick={() =>
                            removeItem(item.id)
                          }
                          disabled={loading}
                          className="text-xs font-semibold text-slate-600 hover:text-red-400 disabled:opacity-50"
                        >
                          Remove
                        </button>

                      </div>

                      <div className="mt-5 flex flex-wrap items-center justify-between gap-4">

                        {/* QUANTITY */}

                        <div className="flex items-center overflow-hidden rounded-xl border border-slate-700 bg-slate-950">

                          <button
                            onClick={() =>
                              updateQuantity(
                                item.id,
                                item.quantity - 1
                              )
                            }
                            disabled={loading}
                            className="flex h-9 w-9 items-center justify-center text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-50"
                          >
                            −
                          </button>

                          <span className="flex h-9 w-10 items-center justify-center border-x border-slate-700 text-xs font-bold">
                            {item.quantity}
                          </span>

                          <button
                            onClick={() =>
                              updateQuantity(
                                item.id,
                                item.quantity + 1
                              )
                            }
                            disabled={loading}
                            className="flex h-9 w-9 items-center justify-center text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-50"
                          >
                            +
                          </button>

                        </div>

                        {/* PRICE */}

                        <div className="text-right">

                          <p className="text-lg font-black">
                            ₹
                            {(
                              Number(
                                item.price
                              ) *
                              Number(
                                item.quantity
                              )
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </p>

                          {item.quantity > 1 && (
                            <p className="text-[11px] text-slate-600">
                              ₹
                              {Number(
                                item.price
                              ).toLocaleString(
                                "en-IN"
                              )}{" "}
                              each
                            </p>
                          )}

                        </div>

                      </div>

                    </div>

                  </div>

                </div>
              ))}

            </div>

            {/* ORDER SUMMARY */}

            <aside className="lg:sticky lg:top-24 lg:self-start">

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

                <h2 className="text-lg font-bold">
                  Order Summary
                </h2>

                <div className="mt-6 space-y-4">

                  <div className="flex justify-between text-sm">

                    <span className="text-slate-500">
                      Subtotal
                    </span>

                    <span className="font-semibold">
                      ₹
                      {subtotal.toLocaleString(
                        "en-IN"
                      )}
                    </span>

                  </div>

                  <div className="flex justify-between text-sm">

                    <span className="text-slate-500">
                      Delivery
                    </span>

                    <span className="font-semibold">

                      {delivery === 0 ? (
                        <span className="text-emerald-400">
                          FREE
                        </span>
                      ) : (
                        `₹${delivery}`
                      )}

                    </span>

                  </div>

                  {delivery === 0 && (
                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-400">
                      🎉 You unlocked free delivery!
                    </div>
                  )}

                  <div className="border-t border-slate-800 pt-4">

                    <div className="flex items-center justify-between">

                      <span className="font-bold">
                        Total
                      </span>

                      <span className="text-2xl font-black">
                        ₹
                        {total.toLocaleString(
                          "en-IN"
                        )}
                      </span>

                    </div>

                  </div>

                </div>

                {/* CHECKOUT */}

                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="mt-6 w-full rounded-xl bg-cyan-500 px-5 py-4 text-sm font-bold text-slate-950 hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading
                    ? "Processing..."
                    : "💳 Proceed to Checkout"}
                </button>

                <button
                  onClick={() =>
                    router.push("/products")
                  }
                  disabled={loading}
                  className="mt-3 w-full rounded-xl border border-slate-700 bg-slate-950 px-5 py-3.5 text-sm font-semibold text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-50"
                >
                  Continue Shopping
                </button>

                {/* SECURITY */}

                <div className="mt-6 border-t border-slate-800 pt-5">

                  <div className="flex gap-3">

                    <span className="text-lg">
                      🔒
                    </span>

                    <div>

                      <p className="text-xs font-bold">
                        Secure Checkout
                      </p>

                      <p className="mt-1 text-[11px] leading-5 text-slate-600">
                        Your payment will be securely processed through Razorpay.
                      </p>

                    </div>

                  </div>

                </div>

              </div>

            </aside>

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

