import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { authRoutes as authPengamanan } from "./routes/auth-pengamanan";
import { usersRoutes as usersPengamanan } from "./routes/users-pengamanan";
import { petugasRoutes as petugasPengamanan } from "./routes/petugas-pengamanan";
import { posRoutes as posPengamanan } from "./routes/pos-pengamanan";
import { qrRoutes as qrPengamanan } from "./routes/qr-pengamanan";
import { pengumumanRoutes as pengumumanPengamanan } from "./routes/pengumuman-pengamanan";
import { logsRoutes as logsPengamanan } from "./routes/logs-pengamanan";
import mobileRoutes from "./routes/mobile-pengamanan";

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
    const { dbPengamanan } = await import("./lib/db-pengamanan");
    // Check database connectivity
    await dbPengamanan.execute({ sql: "SELECT 1" });
    return c.json({ status: "ok", database: "connected" }, 200);
  } catch (error) {
    return c.json({ status: "error", database: "disconnected" }, 503);
  }
});

// ============================================================================
// API ROUTES
// ============================================================================

// Authentication routes
app.route("/api/auth", authPengamanan);

// User management routes
app.route("/api/users", usersPengamanan);

// Petugas Jaga routes
app.route("/api/petugas", petugasPengamanan);

// Pos Jaga routes
app.route("/api/pos", posPengamanan);

// QR Codes routes
app.route("/api/qr", qrPengamanan);

// Pengumuman routes
app.route("/api/pengumuman", pengumumanPengamanan);

// Logs & Reporting routes
app.route("/api/logs", logsPengamanan);

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
    const { dbPengamanan } = await import("./lib/db-pengamanan");
    // Close database connection
    await dbPengamanan.disconnect();
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
