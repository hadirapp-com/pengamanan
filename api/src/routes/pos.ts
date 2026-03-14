import { Hono } from "hono";
import { z } from "zod";
import { db } from "../lib/db";
import { posJaga } from "../lib/schema";
import { eq, and, asc, sql } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth";

const posRoutes = new Hono();

// Apply auth middleware to all routes
posRoutes.use("/*", authMiddleware);

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const createPosSchema = z.object({
  nama: z.string().min(1, "Nama is required").max(255, "Nama must not exceed 255 characters"),
  lokasi: z.string().optional(),
});

const updatePosSchema = z.object({
  nama: z.string().min(1).max(255).optional(),
  lokasi: z.string().optional(),
  isActive: z.boolean().optional(),
});

const listPosSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
});

// ============================================================================
// ROUTES
// ============================================================================

/**
 * GET /pos
 * List pos jaga with pagination and filtering
 */
posRoutes.get("/", async (c) => {
  try {
    const queryParams = c.req.query();
    const validationResult = listPosSchema.safeParse(queryParams);

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

    // Exclude soft-deleted records
    conditions.push(sql`${posJaga.deletedAt} IS NULL`);

    // Filter by isActive
    if (isActive !== undefined) {
      conditions.push(eq(posJaga.isActive, isActive));
    }

    // Search by nama
    if (search) {
      conditions.push(
        sql`${posJaga.nama} ILIKE ${`%${search}%`}`
      );
    }

    // Combine all conditions with AND
    const whereClause =
      conditions.length > 1 ? and(...conditions) : conditions[0];

    // Get total count
    const totalCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(posJaga)
      .where(whereClause);

    const totalCount = totalCountResult[0]?.count || 0;
    const totalPages = Math.ceil(totalCount / limit);

    // Get pos jaga
    const posList = await db
      .select({
        id: posJaga.id,
        nama: posJaga.nama,
        lokasi: posJaga.lokasi,
        isActive: posJaga.isActive,
        createdAt: posJaga.createdAt,
        updatedAt: posJaga.updatedAt,
      })
      .from(posJaga)
      .where(whereClause)
      .orderBy(asc(posJaga.nama))
      .limit(limit)
      .offset(offset);

    return c.json({
      success: true,
      data: posList,
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
    console.error("List pos jaga error:", error);
    return c.json(
      {
        success: false,
        error: "Internal Server Error",
        message: "An error occurred while fetching pos jaga",
      },
      500
    );
  }
});

/**
 * GET /pos/:id
 * Get pos jaga by ID
 */
posRoutes.get("/:id", async (c) => {
  try {
    const posId = c.req.param("id");

    const posResult = await db
      .select({
        id: posJaga.id,
        nama: posJaga.nama,
        lokasi: posJaga.lokasi,
        isActive: posJaga.isActive,
        createdAt: posJaga.createdAt,
        updatedAt: posJaga.updatedAt,
        deletedAt: posJaga.deletedAt,
      })
      .from(posJaga)
      .where(eq(posJaga.id, posId))
      .limit(1);

    if (posResult.length === 0) {
      return c.json(
        {
          success: false,
          error: "Not Found",
          message: "Pos jaga not found",
        },
        404
      );
    }

    return c.json({
      success: true,
      data: posResult[0],
    });
  } catch (error) {
    console.error("Get pos jaga error:", error);
    return c.json(
      {
        success: false,
        error: "Internal Server Error",
        message: "An error occurred while fetching pos jaga",
      },
      500
    );
  }
});

/**
 * POST /pos
 * Create new pos jaga
 */
posRoutes.post("/", async (c) => {
  try {
    const currentUser = c.get("user");
    const body = await c.req.json();
    const validationResult = createPosSchema.safeParse(body);

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

    const data = validationResult.data;

    // Create pos jaga
    const newPosResult = await db
      .insert(posJaga)
      .values({
        ...data,
        createdBy: currentUser.userId,
        updatedBy: currentUser.userId,
      })
      .returning({
        id: posJaga.id,
        nama: posJaga.nama,
        lokasi: posJaga.lokasi,
        isActive: posJaga.isActive,
        createdAt: posJaga.createdAt,
        updatedAt: posJaga.updatedAt,
      });

    return c.json(
      {
        success: true,
        message: "Pos jaga created successfully",
        data: newPosResult[0],
      },
      201
    );
  } catch (error) {
    console.error("Create pos jaga error:", error);
    return c.json(
      {
        success: false,
        error: "Internal Server Error",
        message: "An error occurred while creating pos jaga",
      },
      500
    );
  }
});

/**
 * PUT /pos/:id
 * Update pos jaga
 */
posRoutes.put("/:id", async (c) => {
  try {
    const currentUser = c.get("user");
    const posId = c.req.param("id");
    const body = await c.req.json();
    const validationResult = updatePosSchema.safeParse(body);

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

    // Check if pos jaga exists
    const existingPos = await db
      .select()
      .from(posJaga)
      .where(eq(posJaga.id, posId))
      .limit(1);

    if (existingPos.length === 0) {
      return c.json(
        {
          success: false,
          error: "Not Found",
          message: "Pos jaga not found",
        },
        404
      );
    }

    // Update pos jaga
    const updatedPosResult = await db
      .update(posJaga)
      .set({
        ...updateData,
        updatedBy: currentUser.userId,
        updatedAt: new Date(),
      })
      .where(eq(posJaga.id, posId))
      .returning({
        id: posJaga.id,
        nama: posJaga.nama,
        lokasi: posJaga.lokasi,
        isActive: posJaga.isActive,
        createdAt: posJaga.createdAt,
        updatedAt: posJaga.updatedAt,
      });

    return c.json({
      success: true,
      message: "Pos jaga updated successfully",
      data: updatedPosResult[0],
    });
  } catch (error) {
    console.error("Update pos jaga error:", error);
    return c.json(
      {
        success: false,
        error: "Internal Server Error",
        message: "An error occurred while updating pos jaga",
      },
      500
    );
  }
});

/**
 * DELETE /pos/:id
 * Soft delete pos jaga
 */
posRoutes.delete("/:id", async (c) => {
  try {
    const currentUser = c.get("user");
    const posId = c.req.param("id");

    // Check if pos jaga exists
    const existingPos = await db
      .select()
      .from(posJaga)
      .where(eq(posJaga.id, posId))
      .limit(1);

    if (existingPos.length === 0) {
      return c.json(
        {
          success: false,
          error: "Not Found",
          message: "Pos jaga not found",
        },
        404
      );
    }

    // Soft delete pos jaga
    await db
      .update(posJaga)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
        updatedBy: currentUser.userId,
      })
      .where(eq(posJaga.id, posId));

    return c.json({
      success: true,
      message: "Pos jaga deleted successfully",
    });
  } catch (error) {
    console.error("Delete pos jaga error:", error);
    return c.json(
      {
        success: false,
        error: "Internal Server Error",
        message: "An error occurred while deleting pos jaga",
      },
      500
    );
  }
});

export default posRoutes;
