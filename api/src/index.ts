import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import authRoutes from "./routes/auth";
import usersRoutes from "./routes/users";
import configsRoutes from "./routes/configs";
import petugasRoutes from "./routes/petugas";
import posRoutes from "./routes/pos";
import qrRoutes from "./routes/qr";
import pengumumanRoutes from "./routes/pengumuman";
import logsRoutes from "./routes/logs";
import mobileRoutes from "./routes/mobile";

const app = new Hono();

// Middlewares
app.use("*", cors({
  origin: (origin) => {
    // Allow requests from Cloudflare Pages and local development
    const allowedOrigins = (
      process.env.CORS_ORIGINS || "http://localhost:5173,https://your-app.pages.dev"
    ).split(",");

    if (!origin) return allowedOrigins[0]; // Allow for same-origin requests
    if (allowedOrigins.includes(origin)) return origin;
    return allowedOrigins[0];
  },
  credentials: true,
}));
app.use("*", logger());

// Root endpoint
app.get("/", (c) => {
  return c.json({
    message: "Pengamanan API is running!",
    version: "1.1.0",
    docs: "/api/docs",
  });
});

// Health check endpoint
app.get("/health", async (c) => {
  try {
    const { db } = await import("./lib/db");
    // Check database connectivity
    await db.execute({ sql: "SELECT 1" });
    return c.json({ status: "ok", database: "connected" }, 200);
  } catch (error) {
    return c.json({ status: "error", database: "disconnected" }, 503);
  }
});

// ============================================================================
// API ROUTES
// ============================================================================

// Authentication routes
app.route("/api/auth", authRoutes);

// User management routes
app.route("/api/users", usersRoutes);

// Config management routes
app.route("/api/configs", configsRoutes);

// Petugas Jaga routes
app.route("/api/petugas", petugasRoutes);

// Pos Jaga routes
app.route("/api/pos", posRoutes);

// QR Codes routes
app.route("/api/qr", qrRoutes);

// Pengumuman routes
app.route("/api/pengumuman", pengumumanRoutes);

// Logs & Reporting routes
app.route("/api/logs", logsRoutes);

// Mobile sync routes (with PIN authentication)
app.route("/api/mobile", mobileRoutes);

// 404 handler
app.notFound((c) => {
  return c.json({
    success: false,
    error: "Not Found",
    message: "The requested endpoint does not exist",
  }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error("Error:", err);
  return c.json({
    success: false,
    error: "Internal Server Error",
    message: err.message || "Something went wrong",
  }, 500);
});

const port = parseInt(process.env.PORT || "3000");

// Graceful shutdown handler
const shutdown = async (signal: string) => {
  console.log(`\nReceived ${signal}. Starting graceful shutdown...`);

  try {
    const { client } = await import("./lib/db");
    // Close database connection
    await client.end();
    console.log("Database connection closed.");
  } catch (error) {
    console.error("Error closing database connection:", error);
  }

  console.log("Graceful shutdown completed. Exiting...");
  process.exit(0);
};

// Start the server
const server = Bun.serve({
  port,
  fetch: app.fetch,
});

console.log(`🚀 Pengamanan API running on http://localhost:${port}`);
console.log(`📚 API endpoints: http://localhost:${port}/api`);
console.log(`❤️  Health check: http://localhost:${port}/health`);

// Handle shutdown signals
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

// Export app for OpenAPI generation
export { app };
