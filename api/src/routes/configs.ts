import { Hono } from "hono";
import { z } from "zod";
import { db } from "../lib/db";
import { configs, users } from "../lib/schema";
import { eq, and, desc, sql, or } from "drizzle-orm";
import { authMiddleware, superadminOnly } from "../middleware/auth";

const configsRoutes = new Hono();

// Apply auth middleware to all routes
configsRoutes.use("/*", authMiddleware);

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const createConfigSchema = z.object({
  key: z.string().min(1, "Key is required").max(100, "Key must not exceed 100 characters").regex(/^[a-zA-Z0-9_]+$/, "Key must only contain letters, numbers, and underscores"),
  value: z.string().min(1, "Value is required"),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

const updateConfigSchema = z.object({
  key: z.string().min(1).max(100).regex(/^[a-zA-Z0-9_]+$/).optional(),
  value: z.string().min(1).optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

const listConfigsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
});

// ============================================================================
// ROUTES
// ============================================================================

/**
 * GET /configs
 * List all configs with pagination and filtering
 */
configsRoutes.get("/", superadminOnly, async (c) => {
  try {
    const queryParams = c.req.query();
    const validationResult = listConfigsSchema.safeParse(queryParams);

    if (!validationResult.success) {
      return c.json(
        {
          success: false,
          error: "Validation Error",
          details: validationResult.error.errors,
        },
        400
      );
    }

    const { page, limit, search, isActive } = validationResult.data;
    const offset = (page - 1) * limit;

    // Build conditions
    const conditions = [];

    // Filter by isActive
    if (isActive !== undefined) {
      conditions.push(eq(configs.isActive, isActive));
    }

    // Search by key or description
    if (search) {
      conditions.push(
        or(
          sql`${configs.key} ILIKE ${`%${search}%`}`,
          sql`${configs.description} ILIKE ${`%${search}%`}`
        )
      );
    }

    // Combine all conditions with AND
    const whereClause =
      conditions.length > 1 ? and(...conditions) : conditions[0];

    // Get total count
    const totalCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(configs)
      .where(whereClause);

    const totalCount = totalCountResult[0]?.count || 0;
    const totalPages = Math.ceil(totalCount / limit);

    // Get configs
    const configList = await db
      .select({
        id: configs.id,
        key: configs.key,
        value: configs.value,
        description: configs.description,
        isActive: configs.isActive,
        createdAt: configs.createdAt,
        updatedAt: configs.updatedAt,
      })
      .from(configs)
      .where(whereClause)
      .orderBy(desc(configs.createdAt))
      .limit(limit)
      .offset(offset);

    return c.json({
      success: true,
      data: configList,
      meta: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error("List configs error:", error);
    return c.json(
      {
        success: false,
        error: "Internal Server Error",
        message: "An error occurred while fetching configs",
      },
      500
    );
  }
});

/**
 * GET /configs/:id
 * Get config by ID
 */
configsRoutes.get("/:id", superadminOnly, async (c) => {
  try {
    const configId = c.req.param("id");

    const configResult = await db
      .select()
      .from(configs)
      .where(eq(configs.id, configId))
      .limit(1);

    if (configResult.length === 0) {
      return c.json(
        {
          success: false,
          error: "Not Found",
          message: "Config not found",
        },
        404
      );
    }

    return c.json({
      success: true,
      data: configResult[0],
    });
  } catch (error) {
    console.error("Get config error:", error);
    return c.json(
      {
        success: false,
        error: "Internal Server Error",
        message: "An error occurred while fetching config",
      },
      500
    );
  }
});

/**
 * GET /configs/key/:key
 * Get config by key
 */
configsRoutes.get("/key/:key", superadminOnly, async (c) => {
  try {
    const configKey = c.req.param("key");

    const configResult = await db
      .select()
      .from(configs)
      .where(eq(configs.key, configKey))
      .limit(1);

    if (configResult.length === 0) {
      return c.json(
        {
          success: false,
          error: "Not Found",
          message: "Config not found",
        },
        404
      );
    }

    return c.json({
      success: true,
      data: configResult[0],
    });
  } catch (error) {
    console.error("Get config by key error:", error);
    return c.json(
      {
        success: false,
        error: "Internal Server Error",
        message: "An error occurred while fetching config",
      },
      500
    );
  }
});

/**
 * POST /configs
 * Create new config
 */
configsRoutes.post("/", superadminOnly, async (c) => {
  try {
    const currentUser = c.get("user");
    const body = await c.req.json();
    const validationResult = createConfigSchema.safeParse(body);

    if (!validationResult.success) {
      return c.json(
        {
          success: false,
          error: "Validation Error",
          details: validationResult.error.errors,
        },
        400
      );
    }

    const { key, value, description, isActive } = validationResult.data;

    // Check if key already exists
    const existingConfig = await db
      .select()
      .from(configs)
      .where(eq(configs.key, key))
      .limit(1);

    if (existingConfig.length > 0) {
      return c.json(
        {
          success: false,
          error: "Conflict",
          message: "Config with this key already exists",
        },
        409
      );
    }

    // Create config
    const newConfigResult = await db
      .insert(configs)
      .values({
        key,
        value,
        description,
        isActive,
        createdBy: currentUser.userId,
        updatedBy: currentUser.userId,
      })
      .returning();

    return c.json(
      {
        success: true,
        message: "Config created successfully",
        data: newConfigResult[0],
      },
      201
    );
  } catch (error) {
    console.error("Create config error:", error);
    return c.json(
      {
        success: false,
        error: "Internal Server Error",
        message: "An error occurred while creating config",
      },
      500
    );
  }
});

/**
 * PUT /configs/:id
 * Update config
 */
configsRoutes.put("/:id", superadminOnly, async (c) => {
  try {
    const currentUser = c.get("user");
    const configId = c.req.param("id");
    const body = await c.req.json();
    const validationResult = updateConfigSchema.safeParse(body);

    if (!validationResult.success) {
      return c.json(
        {
          success: false,
          error: "Validation Error",
          details: validationResult.error.errors,
        },
        400
      );
    }

    // Check if config exists
    const existingConfig = await db
      .select()
      .from(configs)
      .where(eq(configs.id, configId))
      .limit(1);

    if (existingConfig.length === 0) {
      return c.json(
        {
          success: false,
          error: "Not Found",
          message: "Config not found",
        },
        404
      );
    }

    const updateData = validationResult.data;

    // If updating key, check for duplicates
    if (updateData.key) {
      const duplicateConfig = await db
        .select()
        .from(configs)
        .where(and(eq(configs.key, updateData.key), sql`${configs.id} != ${configId}`))
        .limit(1);

      if (duplicateConfig.length > 0) {
        return c.json(
          {
            success: false,
            error: "Conflict",
            message: "Config with this key already exists",
          },
          409
        );
      }
    }

    // Update config
    const updatedConfigResult = await db
      .update(configs)
      .set({
        ...updateData,
        updatedBy: currentUser.userId,
        updatedAt: new Date(),
      })
      .where(eq(configs.id, configId))
      .returning();

    return c.json({
      success: true,
      message: "Config updated successfully",
      data: updatedConfigResult[0],
    });
  } catch (error) {
    console.error("Update config error:", error);
    return c.json(
      {
        success: false,
        error: "Internal Server Error",
        message: "An error occurred while updating config",
      },
      500
    );
  }
});

/**
 * DELETE /configs/:id
 * Delete config (soft delete by setting isActive to false)
 */
configsRoutes.delete("/:id", superadminOnly, async (c) => {
  try {
    const currentUser = c.get("user");
    const configId = c.req.param("id");

    // Check if config exists
    const existingConfig = await db
      .select()
      .from(configs)
      .where(eq(configs.id, configId))
      .limit(1);

    if (existingConfig.length === 0) {
      return c.json(
        {
          success: false,
          error: "Not Found",
          message: "Config not found",
        },
        404
      );
    }

    // Soft delete config (set isActive to false)
    await db
      .update(configs)
      .set({
        isActive: false,
        updatedBy: currentUser.userId,
        updatedAt: new Date(),
      })
      .where(eq(configs.id, configId));

    return c.json({
      success: true,
      message: "Config deleted successfully",
    });
  } catch (error) {
    console.error("Delete config error:", error);
    return c.json(
      {
        success: false,
        error: "Internal Server Error",
        message: "An error occurred while deleting config",
      },
      500
    );
  }
});

export default configsRoutes;
