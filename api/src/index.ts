import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { auth } from "./routes/auth";
import { customers } from "./routes/customers";
import { deliveries } from "./routes/deliveries";
import { users } from "./routes/users";
import { menus } from "./routes/menus";
import { parts } from "./routes/parts";
import { scanLogs } from "./routes/scan-logs";
import { configs } from "./routes/configs";
import { profile } from "./routes/profile";
import { whatsapp } from "./routes/whatsapp";
import { client, db } from "./lib/db";
import { configs as configsTable } from "./lib/schema";
import { eq } from "drizzle-orm";

const app = new Hono();

// Middlewares
app.use("*", cors());
app.use("*", logger());

// Root endpoint
app.get("/", (c) => {
  return c.json({ message: "Pokayoke API is running!" });
});


// Health check endpoint
app.get("/health", async (c) => {
  try {
    // Optionally check database connectivity
    await client`SELECT 1`;
    return c.json({ status: "ok", database: "connected" }, 200);
  } catch (error) {
    return c.json({ status: "error", database: "disconnected" }, 503);
  }
});

// Root endpoint
app.get("/setup", async (c) => {
  try {
    // Get Sentry DSN from database configs
    const sentryConfig = await db
      .select()
      .from(configsTable)
      .where(eq(configsTable.key, "SENTRY_DSN"))
      .limit(1);

    // value is JSONB type, so it can be string, object, or array
    // For SENTRY_DSN, we store it as a string, so it comes back as a string
    const sentryDsn =
      (sentryConfig[0]?.value as string) ||
      "https://bf5cbfc98bf34f712c798c11b072b7b2@o4510961584439296.ingest.us.sentry.io/4510961586995200";

    return c.json({ sentryDsn });
  } catch (error) {
    console.error("Error fetching sentry config:", error);
    // Return default DSN on error
    return c.json({
      sentryDsn:
        "https://bf5cbfc98bf34f712c798c11b072b7b2@o4510961584439296.ingest.us.sentry.io/4510961586995200",
    });
  }
});

// Routes
app.route("/auth", auth);
app.route("/customers", customers);
app.route("/deliveries", deliveries);
app.route("/users", users);
app.route("/menus", menus);
app.route("/parts", parts);
app.route("/scan-logs", scanLogs);
app.route("/configs", configs);
app.route("/profile", profile);
app.route("/whatsapp", whatsapp);

// 404 handler
app.notFound((c) => {
  return c.json({ error: "Route not found" }, 404);
});

// Error handler
app.onError((err, c) => {
  // console.error(err);
  return c.json({ error: "Something went wrong" }, 500);
});

const port = parseInt(process.env.PORT || "5000");

// Graceful shutdown handler
const shutdown = async (signal: string) => {
  console.log(`\nReceived ${signal}. Starting graceful shutdown...`);

  try {
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

console.log(`Server running on http://localhost:${port}`);

// Handle shutdown signals
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

// Export app for OpenAPI generation
export { app };
