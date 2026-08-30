"use client";

import { useEffect, useState } from "react";

interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  name: string;
  category: string | null;
  price: string;
  quantity: number;
  emoji: string | null;
}

interface Order {
  id: number;
  razorpay_order_id: string;
  razorpay_payment_id: string | null;
  amount: string;
  currency: string;
  status: string;
  created_at: string;
  items: OrderItem[];
}

export default function Transactions() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // FETCH TRANSACTIONS
  // ==========================================

  const fetchOrders = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/orders"
      );

      if (!response.ok) {
        throw new Error(
          "Failed to fetch transactions"
        );
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(
          data.error ||
            "Failed to load transactions"
        );
      }

      setOrders(data.orders || []);
    } catch (error) {
      console.error(
        "Error fetching transactions:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to load transactions"
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // LOAD ON PAGE OPEN
  // ==========================================

  useEffect(() => {
    fetchOrders();
  }, []);

  // ==========================================
  // STATISTICS
  // ==========================================

  const successfulOrders = orders.filter(
    (order) => order.status === "paid"
  );

  const totalRevenue = successfulOrders.reduce(
    (total, order) =>
      total + Number(order.amount),
    0
  );

  const successfulPayments =
    successfulOrders.length;

  const averageOrderValue =
    successfulPayments > 0
      ? totalRevenue / successfulPayments
      : 0;

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f5f7fb",
        padding: "40px 20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {/* =====================================
            HEADER
        ====================================== */}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "30px",
            gap: "20px",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "32px",
                color: "#111827",
              }}
            >
              Transactions
            </h1>

            <p
              style={{
                color: "#6b7280",
                marginTop: "8px",
              }}
            >
              Manage and monitor your IntentCart
              payments
            </p>
          </div>

          <button
            onClick={fetchOrders}
            disabled={loading}
            style={{
              padding: "12px 20px",
              borderRadius: "8px",
              border: "none",
              background: "#111827",
              color: "white",
              cursor: loading
                ? "not-allowed"
                : "pointer",
              fontWeight: "bold",
              opacity: loading ? 0.6 : 1,
            }}
          >
            ↻ Refresh
          </button>
        </div>

        {/* =====================================
            ERROR
        ====================================== */}

        {error && (
          <div
            style={{
              background: "#fee2e2",
              color: "#991b1b",
              padding: "15px 20px",
              borderRadius: "10px",
              marginBottom: "25px",
              border: "1px solid #fecaca",
            }}
          >
            {error}
          </div>
        )}

        {/* =====================================
            STATISTICS
        ====================================== */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "20px",
            marginBottom: "30px",
          }}
        >
          {/* TOTAL REVENUE */}

          <div
            style={{
              background: "white",
              padding: "25px",
              borderRadius: "12px",
              boxShadow:
                "0 2px 8px rgba(0,0,0,0.06)",
            }}
          >
            <p
              style={{
                color: "#6b7280",
                margin: 0,
              }}
            >
              Total Revenue
            </p>

            <h2
              style={{
                fontSize: "28px",
                margin: "10px 0 0",
                color: "#111827",
              }}
            >
              ₹{totalRevenue.toFixed(2)}
            </h2>
          </div>

          {/* TOTAL TRANSACTIONS */}

          <div
            style={{
              background: "white",
              padding: "25px",
              borderRadius: "12px",
              boxShadow:
                "0 2px 8px rgba(0,0,0,0.06)",
            }}
          >
            <p
              style={{
                color: "#6b7280",
                margin: 0,
              }}
            >
              Total Transactions
            </p>

            <h2
              style={{
                fontSize: "28px",
                margin: "10px 0 0",
                color: "#111827",
              }}
            >
              {orders.length}
            </h2>
          </div>

          {/* SUCCESSFUL */}

          <div
            style={{
              background: "white",
              padding: "25px",
              borderRadius: "12px",
              boxShadow:
                "0 2px 8px rgba(0,0,0,0.06)",
            }}
          >
            <p
              style={{
                color: "#6b7280",
                margin: 0,
              }}
            >
              Successful Payments
            </p>

            <h2
              style={{
                fontSize: "28px",
                margin: "10px 0 0",
                color: "#16a34a",
              }}
            >
              {successfulPayments}
            </h2>
          </div>

          {/* AVERAGE ORDER */}

          <div
            style={{
              background: "white",
              padding: "25px",
              borderRadius: "12px",
              boxShadow:
                "0 2px 8px rgba(0,0,0,0.06)",
            }}
          >
            <p
              style={{
                color: "#6b7280",
                margin: 0,
              }}
            >
              Average Order Value
            </p>

            <h2
              style={{
                fontSize: "28px",
                margin: "10px 0 0",
                color: "#111827",
              }}
            >
              ₹{averageOrderValue.toFixed(2)}
            </h2>
          </div>
        </div>

        {/* =====================================
            PAYMENT HISTORY
        ====================================== */}

        <div
          style={{
            background: "white",
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow:
              "0 2px 8px rgba(0,0,0,0.06)",
          }}
        >
          <div
            style={{
              padding: "25px",
              borderBottom:
                "1px solid #e5e7eb",
            }}
          >
            <h2
              style={{
                margin: 0,
                color: "#111827",
              }}
            >
              Payment History
            </h2>

            <p
              style={{
                marginTop: "6px",
                color: "#6b7280",
                fontSize: "14px",
              }}
            >
              Complete payment and purchased
              product details
            </p>
          </div>

          {/* LOADING */}

          {loading ? (
            <div
              style={{
                padding: "40px",
                textAlign: "center",
                color: "#6b7280",
              }}
            >
              Loading transactions...
            </div>
          ) : orders.length === 0 ? (
            /* EMPTY */

            <div
              style={{
                padding: "40px",
                textAlign: "center",
                color: "#6b7280",
              }}
            >
              No transactions found.
            </div>
          ) : (
            /* TRANSACTIONS */

            <div>
              {orders.map((order) => (
                <div
                  key={`order-${order.id}`}
                  style={{
                    padding: "25px",
                    borderBottom:
                      "1px solid #e5e7eb",
                  }}
                >
                  {/* ORDER HEADER */}

                  <div
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      alignItems: "flex-start",
                      gap: "20px",
                      flexWrap: "wrap",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          flexWrap: "wrap",
                        }}
                      >
                        <h3
                          style={{
                            margin: 0,
                            fontSize: "18px",
                            color: "#111827",
                          }}
                        >
                          Order #{order.id}
                        </h3>

                        <span
                          style={{
                            background:
                              order.status ===
                              "paid"
                                ? "#dcfce7"
                                : "#fef3c7",
                            color:
                              order.status ===
                              "paid"
                                ? "#166534"
                                : "#92400e",
                            padding:
                              "5px 10px",
                            borderRadius: "20px",
                            fontSize: "12px",
                            fontWeight: "bold",
                          }}
                        >
                          {order.status.toUpperCase()}
                        </span>
                      </div>

                      <p
                        style={{
                          margin:
                            "7px 0 0",
                          color: "#6b7280",
                          fontSize: "13px",
                        }}
                      >
                        {new Date(
                          order.created_at
                        ).toLocaleString()}
                      </p>
                    </div>

                    <div
                      style={{
                        textAlign: "right",
                      }}
                    >
                      <p
                        style={{
                          margin: 0,
                          fontSize: "24px",
                          fontWeight: "bold",
                          color: "#111827",
                        }}
                      >
                        ₹
                        {Number(
                          order.amount
                        ).toFixed(2)}
                      </p>

                      <p
                        style={{
                          margin:
                            "4px 0 0",
                          fontSize: "12px",
                          color: "#6b7280",
                        }}
                      >
                        {order.currency}
                      </p>
                    </div>
                  </div>

                  {/* =================================
                      PRODUCTS
                  ================================== */}

                  <div
                    style={{
                      marginTop: "20px",
                      background: "#f9fafb",
                      borderRadius: "10px",
                      padding: "15px",
                    }}
                  >
                    <h4
                      style={{
                        margin:
                          "0 0 12px",
                        fontSize: "14px",
                        color: "#374151",
                      }}
                    >
                      🛒 Purchased Products
                    </h4>

                    {order.items &&
                    order.items.length > 0 ? (
                      <div
                        style={{
                          display: "flex",
                          flexDirection:
                            "column",
                          gap: "10px",
                        }}
                      >
                        {order.items.map(
                          (item) => (
                            <div
                              key={`item-${item.id}`}
                              style={{
                                display: "flex",
                                alignItems:
                                  "center",
                                justifyContent:
                                  "space-between",
                                gap: "15px",
                                background:
                                  "white",
                                padding:
                                  "12px",
                                borderRadius:
                                  "8px",
                                border:
                                  "1px solid #e5e7eb",
                              }}
                            >
                              {/* PRODUCT INFO */}

                              <div
                                style={{
                                  display:
                                    "flex",
                                  alignItems:
                                    "center",
                                  gap: "12px",
                                  minWidth: 0,
                                }}
                              >
                                <div
                                  style={{
                                    width:
                                      "45px",
                                    height:
                                      "45px",
                                    borderRadius:
                                      "10px",
                                    background:
                                      "#f3f4f6",
                                    display:
                                      "flex",
                                    alignItems:
                                      "center",
                                    justifyContent:
                                      "center",
                                    fontSize:
                                      "24px",
                                    flexShrink: 0,
                                  }}
                                >
                                  {item.emoji ||
                                    "📦"}
                                </div>

                                <div>
                                  <p
                                    style={{
                                      margin: 0,
                                      fontWeight:
                                        "bold",
                                      color:
                                        "#111827",
                                    }}
                                  >
                                    {item.name}
                                  </p>

                                  <p
                                    style={{
                                      margin:
                                        "4px 0 0",
                                      fontSize:
                                        "12px",
                                      color:
                                        "#6b7280",
                                    }}
                                  >
                                    {item.category ||
                                      "Product"}{" "}
                                    · Qty:{" "}
                                    {item.quantity}
                                  </p>
                                </div>
                              </div>

                              {/* ITEM PRICE */}

                              <div
                                style={{
                                  textAlign:
                                    "right",
                                  flexShrink: 0,
                                }}
                              >
                                <p
                                  style={{
                                    margin: 0,
                                    fontWeight:
                                      "bold",
                                    color:
                                      "#111827",
                                  }}
                                >
                                  ₹
                                  {(
                                    Number(
                                      item.price
                                    ) *
                                    item.quantity
                                  ).toFixed(2)}
                                </p>

                                {item.quantity >
                                  1 && (
                                  <p
                                    style={{
                                      margin:
                                        "3px 0 0",
                                      fontSize:
                                        "11px",
                                      color:
                                        "#6b7280",
                                    }}
                                  >
                                    ₹
                                    {Number(
                                      item.price
                                    ).toFixed(
                                      2
                                    )}{" "}
                                    each
                                  </p>
                                )}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    ) : (
                      <p
                        style={{
                          margin: 0,
                          color: "#9ca3af",
                          fontSize: "13px",
                        }}
                      >
                        Product details are not
                        available for this order.
                      </p>
                    )}
                  </div>

                  {/* =================================
                      PAYMENT DETAILS
                  ================================== */}

                  <div
                    style={{
                      marginTop: "15px",
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(250px, 1fr))",
                      gap: "10px",
                    }}
                  >
                    <div
                      style={{
                        background: "#f9fafb",
                        padding: "12px",
                        borderRadius: "8px",
                      }}
                    >
                      <p
                        style={{
                          margin: 0,
                          fontSize: "11px",
                          color: "#9ca3af",
                          textTransform:
                            "uppercase",
                        }}
                      >
                        Razorpay Order ID
                      </p>

                      <p
                        style={{
                          margin:
                            "5px 0 0",
                          fontSize: "12px",
                          color: "#374151",
                          fontFamily:
                            "monospace",
                          wordBreak:
                            "break-all",
                        }}
                      >
                        {order.razorpay_order_id}
                      </p>
                    </div>

                    <div
                      style={{
                        background: "#f9fafb",
                        padding: "12px",
                        borderRadius: "8px",
                      }}
                    >
                      <p
                        style={{
                          margin: 0,
                          fontSize: "11px",
                          color: "#9ca3af",
                          textTransform:
                            "uppercase",
                        }}
                      >
                        Razorpay Payment ID
                      </p>

                      <p
                        style={{
                          margin:
                            "5px 0 0",
                          fontSize: "12px",
                          color: "#374151",
                          fontFamily:
                            "monospace",
                          wordBreak:
                            "break-all",
                        }}
                      >
                        {order.razorpay_payment_id ||
                          "Not paid"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}