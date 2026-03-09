import { Hono } from "hono";
import { z } from "zod";
import { db } from "../lib/db";
import { configs } from "../lib/schema";
import { eq, desc, like, or, count } from "drizzle-orm";
import { authMiddleware, roleValidationMiddleware } from "../middleware/auth";
import { configSchema, configUpdateSchema } from "../schemas";

const configsRoute = new Hono();

// Apply auth middleware to all routes
configsRoute.use("*", authMiddleware);

// Get all configs - accessible by admin role
configsRoute.get("/", roleValidationMiddleware(["admin"]), async (c) => {
  try {
    const page = parseInt(c.req.query("page") || "1");
    const limit = parseInt(c.req.query("limit") || "10");
    const search = c.req.query("search");

    const skip = (page - 1) * limit;

    let whereConditions = [];

    if (search) {
      whereConditions.push(
        or(
          like(configs.key, `%${search}%`),
          like(configs.description || "", `%${search}%`)
        )
      );
    }

    const where = whereConditions.length > 0 ? or(...whereConditions) : undefined;

    const [configsData, totalResult] = await Promise.all([
      db.select().from(configs)
        .where(where)
        .limit(limit)
        .offset(skip)
        .orderBy(desc(configs.createdAt)),
      db.select({ count: count() }).from(configs).where(where),
    ]);

    const total = totalResult[0]?.count || 0;

    return c.json({
      result: configsData,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Get config by key - accessible by admin and supervisor roles
configsRoute.get("/:key", roleValidationMiddleware(["*"]), async (c) => {
  try {
    const key = c.req.param("key");

    const configResult = await db.select().from(configs).where(eq(configs.key, key)).limit(1);
    const config = configResult[0];

    if (!config) {
      return c.json({ error: "Config not found" }, 404);
    }

    return c.json({ result: config });
  } catch (error) {
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Create config - only accessible by admin role
configsRoute.post("/", roleValidationMiddleware(["admin"]), async (c) => {
  try {
    const body = await c.req.json();
    const data = configSchema.parse(body);

    const [config] = await db.insert(configs).values(data).returning();

    return c.json(
      {
        message: "Config created successfully",
        config,
      },
      201
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: error.message }, 400);
    }
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Update config by key - only accessible by admin role
configsRoute.put("/:key", roleValidationMiddleware(["admin"]), async (c) => {
  try {
    const key = c.req.param("key");
    const body = await c.req.json();
    const data = configUpdateSchema.parse(body);

    // Check if config exists
    const existingConfig = await db.select().from(configs).where(eq(configs.key, key)).limit(1);
    if (!existingConfig[0]) {
      return c.json({ error: "Config not found" }, 404);
    }

    const [config] = await db.update(configs)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(configs.key, key))
      .returning();

    return c.json({
      message: "Config updated successfully",
      config,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: error.message }, 400);
    }
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Delete config by key - only accessible by admin role
configsRoute.delete("/:key", roleValidationMiddleware(["admin"]), async (c) => {
  try {
    const key = c.req.param("key");

    const [deletedConfig] = await db.delete(configs)
      .where(eq(configs.key, key))
      .returning();

    if (!deletedConfig) {
      return c.json({ error: "Config not found" }, 404);
    }

    return c.json({ message: "Config deleted successfully" });
  } catch (error) {
    return c.json({ error: "Internal server error" }, 500);
  }
});

export { configsRoute as configs };
