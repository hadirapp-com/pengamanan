import { Hono } from "hono";
import { z } from "zod";
import { dbPengamanan } from "../lib/db-pengamanan";
import { pengumuman } from "../lib/schema-pengamanan";
import { eq, and, desc, sql } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth-pengamanan";

const pengumumanRoutes = new Hono();

// Apply auth middleware to all routes
pengumumanRoutes.use("/*", authMiddleware);

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const createPengumumanSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title must not exceed 255 characters"),
  content: z.string().min(1, "Content is required"),
  priority: z.enum(["normal", "important", "urgent"], {
    errorMap: () => ({ message: "Priority must be normal, important, or urgent" }),
  }),
});

const updatePengumumanSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  content: z.string().min(1).optional(),
  priority: z.enum(["normal", "important", "urgent"]).optional(),
  isActive: z.boolean().optional(),
});

const listPengumumanSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  priority: z.enum(["normal", "important", "urgent"]).optional(),
  isActive: z.coerce.boolean().optional(),
});

// ============================================================================
// ROUTES
// ============================================================================

/**
 * GET /pengumuman
 * List pengumuman with pagination and filtering
 */
pengumumanRoutes.get("/", async (c) => {
  try {
    const queryParams = c.req.query();
    const validationResult = listPengumumanSchema.safeParse(queryParams);

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

    const { page, limit, search, priority, isActive } = validationResult.data;
    const offset = (page - 1) * limit;

    // Build conditions
    const conditions = [];

    // Exclude soft-deleted records
    conditions.push(sql`${pengumuman.deletedAt} IS NULL`);

    // Filter by priority
    if (priority) {
      conditions.push(eq(pengumuman.priority, priority));
    }

    // Filter by isActive
    if (isActive !== undefined) {
      conditions.push(eq(pengumuman.isActive, isActive));
    }

    // Search by title or content
    if (search) {
      conditions.push(
        sql`(${pengumuman.title} ILIKE ${`%${search}%`} OR ${pengumuman.content} ILIKE ${`%${search}%`})`
      );
    }

    // Combine all conditions with AND
    const whereClause =
      conditions.length > 1 ? and(...conditions) : conditions[0];

    // Get total count
    const totalCountResult = await dbPengamanan
      .select({ count: sql<number>`count(*)` })
      .from(pengumuman)
      .where(whereClause);

    const totalCount = totalCountResult[0]?.count || 0;
    const totalPages = Math.ceil(totalCount / limit);

    // Get pengumuman
    const pengumumanList = await dbPengamanan
      .select({
        id: pengumuman.id,
        title: pengumuman.title,
        content: pengumuman.content,
        priority: pengumuman.priority,
        isActive: pengumuman.isActive,
        createdAt: pengumuman.createdAt,
        updatedAt: pengumuman.updatedAt,
      })
      .from(pengumuman)
      .where(whereClause)
      .orderBy(desc(pengumuman.createdAt))
      .limit(limit)
      .offset(offset);

    return c.json({
      success: true,
      data: pengumumanList,
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
    console.error("List pengumuman error:", error);
    return c.json(
      {
        success: false,
        error: "Internal Server Error",
        message: "An error occurred while fetching pengumuman",
      },
      500
    );
  }
});

/**
 * GET /pengumuman/:id
 * Get pengumuman by ID
 */
pengumumanRoutes.get("/:id", async (c) => {
  try {
    const pengumumanId = c.req.param("id");

    const pengumumanResult = await dbPengamanan
      .select()
      .from(pengumuman)
      .where(eq(pengumuman.id, pengumumanId))
      .limit(1);

    if (pengumumanResult.length === 0) {
      return c.json(
        {
          success: false,
          error: "Not Found",
          message: "Pengumuman not found",
        },
        404
      );
    }

    return c.json({
      success: true,
      data: pengumumanResult[0],
    });
  } catch (error) {
    console.error("Get pengumuman error:", error);
    return c.json(
      {
        success: false,
        error: "Internal Server Error",
        message: "An error occurred while fetching pengumuman",
      },
      500
    );
  }
});

/**
 * POST /pengumuman
 * Create new pengumuman
 */
pengumumanRoutes.post("/", async (c) => {
  try {
    const currentUser = c.get("user");
    const body = await c.req.json();
    const validationResult = createPengumumanSchema.safeParse(body);

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

    const { title, content, priority } = validationResult.data;

    // Create pengumuman
    const newPengumumanResult = await dbPengamanan
      .insert(pengumuman)
      .values({
        title,
        content,
        priority,
        createdBy: currentUser.userId,
        updatedBy: currentUser.userId,
      })
      .returning({
        id: pengumuman.id,
        title: pengumuman.title,
        content: pengumuman.content,
        priority: pengumuman.priority,
        isActive: pengumuman.isActive,
        createdAt: pengumuman.createdAt,
        updatedAt: pengumuman.updatedAt,
      });

    return c.json(
      {
        success: true,
        message: "Pengumuman created successfully",
        data: newPengumumanResult[0],
      },
      201
    );
  } catch (error) {
    console.error("Create pengumuman error:", error);
    return c.json(
      {
        success: false,
        error: "Internal Server Error",
        message: "An error occurred while creating pengumuman",
      },
      500
    );
  }
});

/**
 * PUT /pengumuman/:id
 * Update pengumuman
 */
pengumumanRoutes.put("/:id", async (c) => {
  try {
    const currentUser = c.get("user");
    const pengumumanId = c.req.param("id");
    const body = await c.req.json();
    const validationResult = updatePengumumanSchema.safeParse(body);

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

    const updateData = validationResult.data;

    // Check if pengumuman exists
    const existingPengumuman = await dbPengamanan
      .select()
      .from(pengumuman)
      .where(eq(pengumuman.id, pengumumanId))
      .limit(1);

    if (existingPengumuman.length === 0) {
      return c.json(
        {
          success: false,
          error: "Not Found",
          message: "Pengumuman not found",
        },
        404
      );
    }

    // Update pengumuman
    const updatedPengumumanResult = await dbPengamanan
      .update(pengumuman)
      .set({
        ...updateData,
        updatedBy: currentUser.userId,
        updatedAt: new Date(),
      })
      .where(eq(pengumuman.id, pengumumanId))
      .returning({
        id: pengumuman.id,
        title: pengumuman.title,
        content: pengumuman.content,
        priority: pengumuman.priority,
        isActive: pengumuman.isActive,
        createdAt: pengumuman.createdAt,
        updatedAt: pengumuman.updatedAt,
      });

    return c.json({
      success: true,
      message: "Pengumuman updated successfully",
      data: updatedPengumumanResult[0],
    });
  } catch (error) {
    console.error("Update pengumuman error:", error);
    return c.json(
      {
        success: false,
        error: "Internal Server Error",
        message: "An error occurred while updating pengumuman",
      },
      500
    );
  }
});

/**
 * DELETE /pengumuman/:id
 * Soft delete pengumuman
 */
pengumumanRoutes.delete("/:id", async (c) => {
  try {
    const currentUser = c.get("user");
    const pengumumanId = c.req.param("id");

    // Check if pengumuman exists
    const existingPengumuman = await dbPengamanan
      .select()
      .from(pengumuman)
      .where(eq(pengumuman.id, pengumumanId))
      .limit(1);

    if (existingPengumuman.length === 0) {
      return c.json(
        {
          success: false,
          error: "Not Found",
          message: "Pengumuman not found",
        },
        404
      );
    }

    // Soft delete pengumuman
    await dbPengamanan
      .update(pengumuman)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
        updatedBy: currentUser.userId,
      })
      .where(eq(pengumuman.id, pengumumanId));

    return c.json({
      success: true,
      message: "Pengumuman deleted successfully",
    });
  } catch (error) {
    console.error("Delete pengumuman error:", error);
    return c.json(
      {
        success: false,
        error: "Internal Server Error",
        message: "An error occurred while deleting pengumuman",
      },
      500
    );
  }
});

export default pengumumanRoutes;
