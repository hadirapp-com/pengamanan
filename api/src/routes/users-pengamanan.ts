import { Hono } from "hono";
import { z } from "zod";
import { dbPengamanan } from "../lib/db-pengamanan";
import { users } from "../lib/schema-pengamanan";
import { eq, and, desc, or, sql } from "drizzle-orm";
import { hashPassword } from "../lib/auth-pengamanan";
import { authMiddleware, superadminOnly } from "../middleware/auth-pengamanan";

const usersRoutes = new Hono();

// Apply auth middleware to all routes
usersRoutes.use("/*", authMiddleware);

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const createUserSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must not exceed 50 characters"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
  role: z.enum(["admin", "superadmin"], {
    errorMap: () => ({ message: "Role must be either admin or superadmin" }),
  }),
});

const updateUserSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must not exceed 50 characters")
    .optional(),
  role: z
    .enum(["admin", "superadmin"])
    .optional(),
});

const listUsersSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  role: z.enum(["admin", "superadmin"]).optional(),
});

// ============================================================================
// ROUTES
// ============================================================================

/**
 * GET /users
 * List users with pagination and filtering (superadmin only)
 */
usersRoutes.get("/", superadminOnly, async (c) => {
  try {
    const queryParams = c.req.query();
    const validationResult = listUsersSchema.safeParse(queryParams);

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

    const { page, limit, search, role } = validationResult.data;
    const offset = (page - 1) * limit;

    // Build conditions
    const conditions = [];

    // Exclude soft-deleted users
    conditions.push(sql`${users.deletedAt} IS NULL`);

    // Filter by role
    if (role) {
      conditions.push(eq(users.role, role));
    }

    // Search by username
    if (search) {
      conditions.push(
        sql`${users.username} ILIKE ${`%${search}%`}`
      );
    }

    // Combine all conditions with AND
    const whereClause =
      conditions.length > 1 ? and(...conditions) : conditions[0];

    // Get total count
    const totalCountResult = await dbPengamanan
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(whereClause);

    const totalCount = totalCountResult[0]?.count || 0;
    const totalPages = Math.ceil(totalCount / limit);

    // Get users
    const usersList = await dbPengamanan
      .select({
        id: users.id,
        username: users.username,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(whereClause)
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset);

    return c.json({
      success: true,
      data: usersList,
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
    console.error("List users error:", error);
    return c.json(
      {
        success: false,
        error: "Internal Server Error",
        message: "An error occurred while fetching users",
      },
      500
    );
  }
});

/**
 * GET /users/:id
 * Get user by ID (superadmin only)
 */
usersRoutes.get("/:id", superadminOnly, async (c) => {
  try {
    const userId = c.req.param("id");

    const userResult = await dbPengamanan
      .select({
        id: users.id,
        username: users.username,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        deletedAt: users.deletedAt,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (userResult.length === 0) {
      return c.json(
        {
          success: false,
          error: "Not Found",
          message: "User not found",
        },
        404
      );
    }

    return c.json({
      success: true,
      data: userResult[0],
    });
  } catch (error) {
    console.error("Get user error:", error);
    return c.json(
      {
        success: false,
        error: "Internal Server Error",
        message: "An error occurred while fetching user",
      },
      500
    );
  }
});

/**
 * POST /users
 * Create new user (superadmin only)
 */
usersRoutes.post("/", superadminOnly, async (c) => {
  try {
    const currentUser = c.get("user");
    const body = await c.req.json();
    const validationResult = createUserSchema.safeParse(body);

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

    const { username, password, role } = validationResult.data;

    // Check if username already exists
    const existingUser = await dbPengamanan
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (existingUser.length > 0) {
      return c.json(
        {
          success: false,
          error: "Conflict",
          message: "Username already exists",
        },
        409
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const newUserResult = await dbPengamanan
      .insert(users)
      .values({
        username,
        passwordHash,
        role,
        createdBy: currentUser.userId,
        updatedBy: currentUser.userId,
      })
      .returning({
        id: users.id,
        username: users.username,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      });

    return c.json(
      {
        success: true,
        message: "User created successfully",
        data: newUserResult[0],
      },
      201
    );
  } catch (error) {
    console.error("Create user error:", error);
    return c.json(
      {
        success: false,
        error: "Internal Server Error",
        message: "An error occurred while creating user",
      },
      500
    );
  }
});

/**
 * PUT /users/:id
 * Update user (superadmin only)
 */
usersRoutes.put("/:id", superadminOnly, async (c) => {
  try {
    const currentUser = c.get("user");
    const userId = c.req.param("id");
    const body = await c.req.json();
    const validationResult = updateUserSchema.safeParse(body);

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

    // Check if user exists
    const existingUser = await dbPengamanan
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (existingUser.length === 0) {
      return c.json(
        {
          success: false,
          error: "Not Found",
          message: "User not found",
        },
        404
      );
    }

    // Prevent self-de modification for role changes
    if (userId === currentUser.userId && updateData.role) {
      return c.json(
        {
          success: false,
          error: "Forbidden",
          message: "You cannot modify your own role",
        },
        403
      );
    }

    // If updating username, check for duplicates
    if (updateData.username) {
      const duplicateUser = await dbPengamanan
        .select()
        .from(users)
        .where(and(eq(users.username, updateData.username), sql`${users.id} != ${userId}`))
        .limit(1);

      if (duplicateUser.length > 0) {
        return c.json(
          {
            success: false,
            error: "Conflict",
            message: "Username already exists",
          },
          409
        );
      }
    }

    // Update user
    const updatedUserResult = await dbPengamanan
      .update(users)
      .set({
        ...updateData,
        updatedBy: currentUser.userId,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        username: users.username,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      });

    return c.json({
      success: true,
      message: "User updated successfully",
      data: updatedUserResult[0],
    });
  } catch (error) {
    console.error("Update user error:", error);
    return c.json(
      {
        success: false,
        error: "Internal Server Error",
        message: "An error occurred while updating user",
      },
      500
    );
  }
});

/**
 * DELETE /users/:id
 * Soft delete user (superadmin only)
 */
usersRoutes.delete("/:id", superadminOnly, async (c) => {
  try {
    const currentUser = c.get("user");
    const userId = c.req.param("id");

    // Prevent self-deletion
    if (userId === currentUser.userId) {
      return c.json(
        {
          success: false,
          error: "Forbidden",
          message: "You cannot delete your own account",
        },
        403
      );
    }

    // Check if user exists
    const existingUser = await dbPengamanan
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (existingUser.length === 0) {
      return c.json(
        {
          success: false,
          error: "Not Found",
          message: "User not found",
        },
        404
      );
    }

    // Soft delete user
    await dbPengamanan
      .update(users)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
        updatedBy: currentUser.userId,
      })
      .where(eq(users.id, userId));

    return c.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    return c.json(
      {
        success: false,
        error: "Internal Server Error",
        message: "An error occurred while deleting user",
      },
      500
    );
  }
});

/**
 * POST /users/:id/reset-password
 * Reset user password (superadmin only)
 */
usersRoutes.post("/:id/reset-password", superadminOnly, async (c) => {
  try {
    const currentUser = c.get("user");
    const userId = c.req.param("id");

    // Generate default password (username + "123")
    const userResult = await dbPengamanan
      .select({ username: users.username })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (userResult.length === 0) {
      return c.json(
        {
          success: false,
          error: "Not Found",
          message: "User not found",
        },
        404
      );
    }

    const defaultPassword = userResult[0].username + "123";
    const passwordHash = await hashPassword(defaultPassword);

    // Update password
    await dbPengamanan
      .update(users)
      .set({
        passwordHash,
        updatedBy: currentUser.userId,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    return c.json({
      success: true,
      message: "Password reset successfully",
      data: {
        defaultPassword,
      },
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return c.json(
      {
        success: false,
        error: "Internal Server Error",
        message: "An error occurred while resetting password",
      },
      500
    );
  }
});

export default usersRoutes;
