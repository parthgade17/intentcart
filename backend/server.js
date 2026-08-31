import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Razorpay from "razorpay";
import crypto from "crypto";
import pg from "pg";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const { Pool } = pg;

// ======================================================
// ENVIRONMENT VARIABLES
// ======================================================

const ADMIN_API_SECRET = process.env.ADMIN_API_SECRET;

if (!ADMIN_API_SECRET) {
  console.error(
    "❌ ADMIN_API_SECRET is missing from backend .env"
  );
  process.exit(1);
}

// ======================================================
// POSTGRESQL CONNECTION
// ======================================================

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool.on("error", (error) => {
  console.error("Unexpected PostgreSQL error:", error);
});

// ======================================================
// EXPRESS
// ======================================================

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());

// ======================================================
// ADMIN API SECURITY
// ======================================================

function requireAdmin(req, res, next) {
  const providedSecret = req.headers["x-admin-api-secret"];

  if (
    !providedSecret ||
    providedSecret !== ADMIN_API_SECRET
  ) {
    return res.status(401).json({
      success: false,
      error: "Unauthorized admin API request",
    });
  }

  next();
}

// ======================================================
// RAZORPAY
// ======================================================

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ======================================================
// GEMINI
// ======================================================

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// ======================================================
// HOME
// ======================================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "IntentCart backend is running",
  });
});

// ======================================================
// DATABASE TEST
// ======================================================

app.get("/api/db-test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.json({
      success: true,
      message: "PostgreSQL connected successfully",
      time: result.rows[0].now,
    });
  } catch (error) {
    console.error("Database connection error:", error);

    res.status(500).json({
      success: false,
      error:
        error.message ||
        "Database connection failed",
    });
  }
});

// ======================================================
// CREATE DATABASE TABLES
// ======================================================

async function createTables() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        razorpay_order_id VARCHAR(100) UNIQUE,
        razorpay_payment_id VARCHAR(100),
        amount NUMERIC(10, 2) NOT NULL,
        currency VARCHAR(10) DEFAULT 'INR',
        status VARCHAR(30) DEFAULT 'created',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100),
        price NUMERIC(10, 2) NOT NULL,
        quantity INTEGER NOT NULL,
        emoji VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_order
          FOREIGN KEY (order_id)
          REFERENCES orders(id)
          ON DELETE CASCADE
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS ai_insights (
        id SERIAL PRIMARY KEY,
        insights TEXT NOT NULL,
        total_revenue NUMERIC(10, 2),
        total_transactions INTEGER,
        average_order_value NUMERIC(10, 2),
        success_rate NUMERIC(5, 2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("PostgreSQL tables ready");
  } catch (error) {
    console.error("Table creation error:", error);
    throw error;
  }
}

// ======================================================
// CREATE RAZORPAY ORDER
// PUBLIC - CUSTOMERS NEED THIS
// ======================================================

app.post("/api/create-order", async (req, res) => {
  try {
    const { amount, items } = req.body;

    if (
      amount === undefined ||
      amount === null ||
      !Number.isFinite(Number(amount)) ||
      Number(amount) <= 0
    ) {
      return res.status(400).json({
        success: false,
        error: "Invalid amount",
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Cart items are required",
      });
    }

    const numericAmount = Number(amount);

    for (const item of items) {
      if (
        item.id === undefined ||
        !item.name ||
        !Number.isFinite(Number(item.price)) ||
        !Number.isFinite(Number(item.quantity)) ||
        Number(item.quantity) <= 0
      ) {
        return res.status(400).json({
          success: false,
          error: "Invalid cart item",
        });
      }
    }

    const amountInPaise = Math.round(
      numericAmount * 100
    );

    const razorpayOrder =
      await razorpay.orders.create({
        amount: amountInPaise,
        currency: "INR",
        receipt: `intentcart_${Date.now()}`,
      });

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const orderResult = await client.query(
        `
        INSERT INTO orders
        (
          razorpay_order_id,
          amount,
          currency,
          status
        )
        VALUES ($1, $2, $3, $4)
        RETURNING *
        `,
        [
          razorpayOrder.id,
          numericAmount,
          "INR",
          "created",
        ]
      );

      const databaseOrder =
        orderResult.rows[0];

      for (const item of items) {
        await client.query(
          `
          INSERT INTO order_items
          (
            order_id,
            product_id,
            name,
            category,
            price,
            quantity,
            emoji
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          `,
          [
            databaseOrder.id,
            Number(item.id),
            String(item.name),
            item.category
              ? String(item.category)
              : null,
            Number(item.price),
            Number(item.quantity),
            item.emoji
              ? String(item.emoji)
              : null,
          ]
        );
      }

      await client.query("COMMIT");

      res.json({
        success: true,
        order: {
          id: databaseOrder.id,
          razorpay_order_id:
            razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency:
            razorpayOrder.currency,
        },
        items,
      });
    } catch (databaseError) {
      await client.query("ROLLBACK");

      console.error(
        "Order database transaction error:",
        databaseError
      );

      throw databaseError;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(
      "Create order error:",
      error
    );

    res.status(500).json({
      success: false,
      error:
        error.message ||
        "Failed to create payment order",
    });
  }
});

// ======================================================
// VERIFY PAYMENT
// PUBLIC - CUSTOMERS NEED THIS
// ======================================================

app.post(
  "/api/verify-payment",
  async (req, res) => {
    try {
      const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      } = req.body;

      if (
        !razorpay_order_id ||
        !razorpay_payment_id ||
        !razorpay_signature
      ) {
        return res.status(400).json({
          success: false,
          error:
            "Missing payment verification details",
        });
      }

      const generatedSignature =
        crypto
          .createHmac(
            "sha256",
            process.env.RAZORPAY_KEY_SECRET
          )
          .update(
            `${razorpay_order_id}|${razorpay_payment_id}`
          )
          .digest("hex");

      if (
        generatedSignature !==
        razorpay_signature
      ) {
        return res.status(400).json({
          success: false,
          error:
            "Invalid payment signature",
        });
      }

      const orderResult =
        await pool.query(
          `
          UPDATE orders
          SET
            razorpay_payment_id = $1,
            status = 'paid'
          WHERE razorpay_order_id = $2
          RETURNING *
          `,
          [
            razorpay_payment_id,
            razorpay_order_id,
          ]
        );

      if (orderResult.rowCount === 0) {
        return res.status(404).json({
          success: false,
          error:
            "Order not found in database",
        });
      }

      const order =
        orderResult.rows[0];

      const itemsResult =
        await pool.query(
          `
          SELECT
            id,
            product_id,
            name,
            category,
            price,
            quantity,
            emoji
          FROM order_items
          WHERE order_id = $1
          ORDER BY id ASC
          `,
          [order.id]
        );

      res.json({
        success: true,
        message:
          "Payment verified and saved successfully",
        order,
        items: itemsResult.rows,
      });
    } catch (error) {
      console.error(
        "Payment verification error:",
        error
      );

      res.status(500).json({
        success: false,
        error:
          error.message ||
          "Payment verification failed",
      });
    }
  }
);

// ======================================================
// GET ALL ORDERS
// PROTECTED ADMIN ENDPOINT
// ======================================================

app.get(
  "/api/orders",
  requireAdmin,
  async (req, res) => {
    try {
      const orderResult =
        await pool.query(`
        SELECT
          id,
          razorpay_order_id,
          razorpay_payment_id,
          amount,
          currency,
          status,
          created_at
        FROM orders
        ORDER BY created_at DESC
      `);

      const orders =
        orderResult.rows;

      if (orders.length > 0) {
        const itemsResult =
          await pool.query(`
          SELECT
            id,
            order_id,
            product_id,
            name,
            category,
            price,
            quantity,
            emoji
          FROM order_items
          ORDER BY id ASC
        `);

        for (const order of orders) {
          order.items =
            itemsResult.rows.filter(
              (item) =>
                item.order_id ===
                order.id
            );
        }
      } else {
        for (const order of orders) {
          order.items = [];
        }
      }

      res.json({
        success: true,
        orders,
      });
    } catch (error) {
      console.error(
        "GET /api/orders error:",
        error
      );

      res.status(500).json({
        success: false,
        error:
          error.message ||
          "Failed to fetch transaction history",
      });
    }
  }
);

// ======================================================
// GET SINGLE ORDER
// PROTECTED ADMIN ENDPOINT
// ======================================================

app.get(
  "/api/orders/:id",
  requireAdmin,
  async (req, res) => {
    try {
      const orderId =
        Number(req.params.id);

      if (!Number.isInteger(orderId)) {
        return res.status(400).json({
          success: false,
          error: "Invalid order ID",
        });
      }

      const orderResult =
        await pool.query(
          `
          SELECT
            id,
            razorpay_order_id,
            razorpay_payment_id,
            amount,
            currency,
            status,
            created_at
          FROM orders
          WHERE id = $1
          `,
          [orderId]
        );

      if (
        orderResult.rows.length === 0
      ) {
        return res.status(404).json({
          success: false,
          error: "Order not found",
        });
      }

      const order =
        orderResult.rows[0];

      const itemsResult =
        await pool.query(
          `
          SELECT
            id,
            product_id,
            name,
            category,
            price,
            quantity,
            emoji
          FROM order_items
          WHERE order_id = $1
          ORDER BY id ASC
          `,
          [orderId]
        );

      res.json({
        success: true,
        order,
        items: itemsResult.rows,
      });
    } catch (error) {
      console.error(
        "GET SINGLE ORDER error:",
        error
      );

      res.status(500).json({
        success: false,
        error:
          error.message ||
          "Failed to fetch order",
      });
    }
  }
);

// ======================================================
// LIVE TRANSACTION METRICS
// PROTECTED ADMIN ENDPOINT
// ======================================================

app.get(
  "/api/metrics",
  requireAdmin,
  async (req, res) => {
    try {
      const result =
        await pool.query(`
        SELECT
          amount,
          status
        FROM orders
      `);

      const orders =
        result.rows;

      const totalTransactions =
        orders.length;

      const successfulOrders =
        orders.filter(
          (order) =>
            order.status === "paid"
        );

      const successfulCount =
        successfulOrders.length;

      const totalRevenue =
        successfulOrders.reduce(
          (total, order) =>
            total +
            Number(order.amount),
          0
        );

      const averageOrderValue =
        successfulCount > 0
          ? totalRevenue /
            successfulCount
          : 0;

      const successRate =
        totalTransactions > 0
          ? (successfulCount /
              totalTransactions) *
            100
          : 0;

      res.json({
        success: true,
        metrics: {
          totalRevenue: Number(
            totalRevenue.toFixed(2)
          ),
          totalTransactions,
          averageOrderValue:
            Number(
              averageOrderValue.toFixed(
                2
              )
            ),
          successRate: Number(
            successRate.toFixed(2)
          ),
        },
      });
    } catch (error) {
      console.error(
        "Metrics error:",
        error
      );

      res.status(500).json({
        success: false,
        error:
          "Failed to fetch live metrics",
      });
    }
  }
);

// ======================================================
// AI INSIGHTS
// PROTECTED ADMIN ENDPOINT
// ======================================================

app.get(
  "/api/ai-insights",
  requireAdmin,
  async (req, res) => {
    try {
      const result =
        await pool.query(`
        SELECT
          id,
          amount,
          currency,
          status,
          created_at
        FROM orders
        ORDER BY created_at DESC
      `);

      const orders =
        result.rows;

      const totalTransactions =
        orders.length;

      const successfulOrders =
        orders.filter(
          (order) =>
            order.status === "paid"
        );

      const successfulCount =
        successfulOrders.length;

      const totalRevenue =
        successfulOrders.reduce(
          (total, order) =>
            total +
            Number(order.amount),
          0
        );

      const averageOrderValue =
        successfulCount > 0
          ? totalRevenue /
            successfulCount
          : 0;

      const successRate =
        totalTransactions > 0
          ? (successfulCount /
              totalTransactions) *
            100
          : 0;

      const metrics = {
        totalRevenue: Number(
          totalRevenue.toFixed(2)
        ),
        totalTransactions,
        averageOrderValue:
          Number(
            averageOrderValue.toFixed(
              2
            )
          ),
        successRate: Number(
          successRate.toFixed(2)
        ),
      };

      // ------------------------------------------------
      // CHECK CACHE
      // ------------------------------------------------

      const cachedResult =
        await pool.query(`
        SELECT
          insights,
          total_revenue,
          total_transactions,
          average_order_value,
          success_rate,
          created_at
        FROM ai_insights
        ORDER BY created_at DESC
        LIMIT 1
      `);

      if (
        cachedResult.rows.length >
        0
      ) {
        const cached =
          cachedResult.rows[0];

        const cacheMatches =
          Number(
            cached.total_revenue
          ) ===
            metrics.totalRevenue &&
          Number(
            cached.total_transactions
          ) ===
            metrics.totalTransactions &&
          Number(
            cached.average_order_value
          ) ===
            metrics.averageOrderValue &&
          Number(
            cached.success_rate
          ) ===
            metrics.successRate;

        if (cacheMatches) {
          return res.json({
            success: true,
            metrics,
            insights:
              cached.insights,
            cached: true,
            cachedAt:
              cached.created_at,
          });
        }
      }

      // ------------------------------------------------
      // NO TRANSACTIONS
      // ------------------------------------------------

      if (orders.length === 0) {
        return res.json({
          success: true,
          metrics,
          insights:
            "There are no transactions to analyze yet.",
          cached: false,
        });
      }

      // ------------------------------------------------
      // TRANSACTION DATA
      // ------------------------------------------------

      const transactionData =
        orders.map((order) => ({
          id: order.id,
          amount: Number(
            order.amount
          ),
          currency:
            order.currency,
          status:
            order.status,
          created_at:
            order.created_at,
        }));

      // ------------------------------------------------
      // GEMINI PROMPT
      // ------------------------------------------------

      const prompt = `
You are the AI Finance Controller for IntentCart.

Analyze the following real transaction data from PostgreSQL.

TRANSACTIONS:

${JSON.stringify(
  transactionData,
  null,
  2
)}

TOTAL REVENUE:
₹${metrics.totalRevenue}

TOTAL TRANSACTIONS:
${metrics.totalTransactions}

AVERAGE ORDER VALUE:
₹${metrics.averageOrderValue}

PAYMENT SUCCESS RATE:
${metrics.successRate}%

Return a concise business analysis using EXACTLY these four sections:

## Payment Performance

Explain:
- Overall payment success rate
- Total successful transactions
- Total revenue
- Average Order Value
- Any payment failures

## Revenue Patterns

Identify:
- Changes in transaction values
- Revenue concentration
- Transaction frequency
- Interesting purchasing patterns

## Risks & Alerts

Identify:
- Low-value transaction risks
- Revenue volatility
- Small sample size risks
- Payment or financial risks

## AI Recommendations

Give exactly 2 practical recommendations for IntentCart.

Use Markdown.
Keep the language professional and easy to understand.
Do not invent transaction data.
`;

      // ------------------------------------------------
      // GEMINI REQUEST
      // ------------------------------------------------

      let response;

      try {
        response =
          await ai.models.generateContent(
            {
              model:
                "gemini-3.6-flash",
              contents: prompt,
            }
          );
      } catch (geminiError) {
        console.error(
          "Gemini AI error:",
          geminiError
        );

        const errorText =
          geminiError?.message ||
          String(geminiError);

        const isQuotaError =
          errorText.includes("429") ||
          errorText.includes(
            "RESOURCE_EXHAUSTED"
          ) ||
          errorText
            .toLowerCase()
            .includes("quota");

        const isTemporaryError =
          errorText.includes("503") ||
          errorText.includes(
            "UNAVAILABLE"
          );

        if (
          cachedResult.rows.length >
          0
        ) {
          const cached =
            cachedResult.rows[0];

          return res.json({
            success: true,
            metrics,
            insights:
              cached.insights,
            cached: true,
            cachedAt:
              cached.created_at,
            warning: isQuotaError
              ? "Gemini free-tier quota reached. Showing the last saved analysis."
              : isTemporaryError
              ? "Gemini is temporarily unavailable. Showing the last saved analysis."
              : "Showing the last saved analysis.",
          });
        }

        if (isQuotaError) {
          return res.status(200).json({
            success: true,
            metrics,
            insights:
              "Gemini AI has reached its current free-tier quota. Your transaction data is available, but a new AI analysis cannot be generated right now. Please try again later.",
            cached: false,
            quotaExceeded: true,
          });
        }

        if (isTemporaryError) {
          return res.status(200).json({
            success: true,
            metrics,
            insights:
              "Gemini AI is temporarily experiencing high demand. Please try again later.",
            cached: false,
            temporaryError: true,
          });
        }

        throw geminiError;
      }

      // ------------------------------------------------
      // AI TEXT
      // ------------------------------------------------

      const insights =
        response.text ||
        "No AI insights generated.";

      // ------------------------------------------------
      // SAVE AI INSIGHTS
      // ------------------------------------------------

      await pool.query(
        `
        INSERT INTO ai_insights
        (
          insights,
          total_revenue,
          total_transactions,
          average_order_value,
          success_rate
        )
        VALUES ($1, $2, $3, $4, $5)
        `,
        [
          insights,
          metrics.totalRevenue,
          metrics.totalTransactions,
          metrics.averageOrderValue,
          metrics.successRate,
        ]
      );

      // ------------------------------------------------
      // RESPONSE
      // ------------------------------------------------

      res.json({
        success: true,
        metrics,
        insights,
        cached: false,
        savedToDatabase: true,
      });
    } catch (error) {
      console.error(
        "AI insights error:",
        error
      );

      res.status(500).json({
        success: false,
        error:
          error.message ||
          "Failed to generate AI insights",
      });
    }
  }
);

// ======================================================
// START SERVER
// ======================================================

const PORT =
  process.env.PORT || 5000;

async function startServer() {
  try {
    await createTables();

    app.listen(
      PORT,
      "0.0.0.0",
      () => {
        console.log(
          `IntentCart backend running on port ${PORT}`
        );
      }
    );
  } catch (error) {
    console.error(
      "Failed to start server:",
      error
    );

    process.exit(1);
  }
}

startServer();

// ======================================================
// ERROR HANDLING
// ======================================================

process.on(
  "uncaughtException",
  (error) => {
    console.error(
      "UNCAUGHT ERROR:",
      error
    );
  }
);

process.on(
  "unhandledRejection",
  (error) => {
    console.error(
      "UNHANDLED REJECTION:",
      error
    );
  }
);