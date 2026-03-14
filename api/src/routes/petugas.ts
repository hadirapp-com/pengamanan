import { Hono } from "hono";
import { z } from "zod";
import { db } from "../lib/db";
import { petugasJaga } from "../lib/schema";
import { eq, and, asc, sql } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth";

const petugasRoutes = new Hono();

// Apply auth middleware to all routes
petugasRoutes.use("/*", authMiddleware);

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const createPetugasSchema = z.object({
  nama: z.string().min(1, "Nama is required").max(255, "Nama must not exceed 255 characters"),
  nik: z.string().length(16, "NIK must be exactly 16 digits").optional(),
  noHp: z.string().regex(/^(0|62)\d{8,12}$/, "No HP must start with 0 or 62 and have 9-13 digits").optional(),
});

const updatePetugasSchema = z.object({
  nama: z.string().min(1).max(255).optional(),
  nik: z.string().length(16).optional(),
  noHp: z.string().regex(/^(0|62)\d{8,12}$/).optional(),
  isActive: z.boolean().optional(),
});

const listPetugasSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
});

// ============================================================================
// ROUTES
// ============================================================================

/**
 * GET /petugas
 * List petugas jaga with pagination and filtering
 */
petugasRoutes.get("/", async (c) => {
  try {
    const queryParams = c.req.query();
    const validationResult = listPetugasSchema.safeParse(queryParams);

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
    conditions.push(sql`${petugasJaga.deletedAt} IS NULL`);

    // Filter by isActive
    if (isActive !== undefined) {
      conditions.push(eq(petugasJaga.isActive, isActive));
    }

    // Search by nama
    if (search) {
      conditions.push(
        sql`${petugasJaga.nama} ILIKE ${`%${search}%`}`
      );
    }

    // Combine all conditions with AND
    const whereClause =
      conditions.length > 1 ? and(...conditions) : conditions[0];

    // Get total count
    const totalCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(petugasJaga)
      .where(whereClause);

    const totalCount = totalCountResult[0]?.count || 0;
    const totalPages = Math.ceil(totalCount / limit);

    // Get petugas jaga
    const petugasList = await db
      .select({
        id: petugasJaga.id,
        nama: petugasJaga.nama,
        nik: petugasJaga.nik,
        noHp: petugasJaga.noHp,
        isActive: petugasJaga.isActive,
        createdAt: petugasJaga.createdAt,
        updatedAt: petugasJaga.updatedAt,
      })
      .from(petugasJaga)
      .where(whereClause)
      .orderBy(asc(petugasJaga.nama))
      .limit(limit)
      .offset(offset);

    return c.json({
      success: true,
      data: petugasList,
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
    console.error("List petugas jaga error:", error);
    return c.json(
      {
        success: false,
        error: "Internal Server Error",
        message: "An error occurred while fetching petugas jaga",
      },
      500
    );
  }
});

/**
 * GET /petugas/:id
 * Get petugas jaga by ID
 */
petugasRoutes.get("/:id", async (c) => {
  try {
    const petugasId = c.req.param("id");

    const petugasResult = await db
      .select({
        id: petugasJaga.id,
        nama: petugasJaga.nama,
        nik: petugasJaga.nik,
        noHp: petugasJaga.noHp,
        isActive: petugasJaga.isActive,
        createdAt: petugasJaga.createdAt,
        updatedAt: petugasJaga.updatedAt,
        deletedAt: petugasJaga.deletedAt,
      })
      .from(petugasJaga)
      .where(eq(petugasJaga.id, petugasId))
      .limit(1);

    if (petugasResult.length === 0) {
      return c.json(
        {
          success: false,
          error: "Not Found",
          message: "Petugas jaga not found",
        },
        404
      );
    }

    return c.json({
      success: true,
      data: petugasResult[0],
    });
  } catch (error) {
    console.error("Get petugas jaga error:", error);
    return c.json(
      {
        success: false,
        error: "Internal Server Error",
        message: "An error occurred while fetching petugas jaga",
      },
      500
    );
  }
});

/**
 * POST /petugas
 * Create new petugas jaga
 */
petugasRoutes.post("/", async (c) => {
  try {
    const currentUser = c.get("user");
    const body = await c.req.json();
    const validationResult = createPetugasSchema.safeParse(body);

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

    // Create petugas jaga
    const newPetugasResult = await db
      .insert(petugasJaga)
      .values({
        ...data,
        createdBy: currentUser.userId,
        updatedBy: currentUser.userId,
      })
      .returning({
        id: petugasJaga.id,
        nama: petugasJaga.nama,
        nik: petugasJaga.nik,
        noHp: petugasJaga.noHp,
        isActive: petugasJaga.isActive,
        createdAt: petugasJaga.createdAt,
        updatedAt: petugasJaga.updatedAt,
      });

    return c.json(
      {
        success: true,
        message: "Petugas jaga created successfully",
        data: newPetugasResult[0],
      },
      201
    );
  } catch (error) {
    console.error("Create petugas jaga error:", error);
    return c.json(
      {
        success: false,
        error: "Internal Server Error",
        message: "An error occurred while creating petugas jaga",
      },
      500
    );
  }
});

/**
 * PUT /petugas/:id
 * Update petugas jaga
 */
petugasRoutes.put("/:id", async (c) => {
  try {
    const currentUser = c.get("user");
    const petugasId = c.req.param("id");
    const body = await c.req.json();
    const validationResult = updatePetugasSchema.safeParse(body);

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

    // Check if petugas jaga exists
    const existingPetugas = await db
      .select()
      .from(petugasJaga)
      .where(eq(petugasJaga.id, petugasId))
      .limit(1);

    if (existingPetugas.length === 0) {
      return c.json(
        {
          success: false,
          error: "Not Found",
          message: "Petugas jaga not found",
        },
        404
      );
    }

    // Update petugas jaga
    const updatedPetugasResult = await db
      .update(petugasJaga)
      .set({
        ...updateData,
        updatedBy: currentUser.userId,
        updatedAt: new Date(),
      })
      .where(eq(petugasJaga.id, petugasId))
      .returning({
        id: petugasJaga.id,
        nama: petugasJaga.nama,
        nik: petugasJaga.nik,
        noHp: petugasJaga.noHp,
        isActive: petugasJaga.isActive,
        createdAt: petugasJaga.createdAt,
        updatedAt: petugasJaga.updatedAt,
      });

    return c.json({
      success: true,
      message: "Petugas jaga updated successfully",
      data: updatedPetugasResult[0],
    });
  } catch (error) {
    console.error("Update petugas jaga error:", error);
    return c.json(
      {
        success: false,
        error: "Internal Server Error",
        message: "An error occurred while updating petugas jaga",
      },
      500
    );
  }
});

/**
 * DELETE /petugas/:id
 * Soft delete petugas jaga
 */
petugasRoutes.delete("/:id", async (c) => {
  try {
    const currentUser = c.get("user");
    const petugasId = c.req.param("id");

    // Check if petugas jaga exists
    const existingPetugas = await db
      .select()
      .from(petugasJaga)
      .where(eq(petugasJaga.id, petugasId))
      .limit(1);

    if (existingPetugas.length === 0) {
      return c.json(
        {
          success: false,
          error: "Not Found",
          message: "Petugas jaga not found",
        },
        404
      );
    }

    // Soft delete petugas jaga
    await db
      .update(petugasJaga)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
        updatedBy: currentUser.userId,
      })
      .where(eq(petugasJaga.id, petugasId));

    return c.json({
      success: true,
      message: "Petugas jaga deleted successfully",
    });
  } catch (error) {
    console.error("Delete petugas jaga error:", error);
    return c.json(
      {
        success: false,
        error: "Internal Server Error",
        message: "An error occurred while deleting petugas jaga",
      },
      500
    );
  }
});

export default petugasRoutes;
