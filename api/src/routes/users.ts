import { Hono } from "hono";
import { z } from "zod";
import { db } from "../lib/db";
import { users } from "../lib/schema";
import { eq, desc, like, or, count, and, ne, isNull } from "drizzle-orm";
import { authMiddleware, roleValidationMiddleware } from "../middleware/auth";
import { userSchema, userUpdateSchema } from "../schemas";

const usersRoute = new Hono();

// Apply auth middleware to all routes
usersRoute.use("*", authMiddleware);

// Get all users - accessible by both admin and user roles
usersRoute.get("/", roleValidationMiddleware(["*"]), async (c) => {
  try {
    const page = parseInt(c.req.query("page") || "1");
    const limit = parseInt(c.req.query("limit") || "10");
    const search = c.req.query("search");

    const skip = (page - 1) * limit;

    let whereConditions = [];
    
    if (search) {
      whereConditions.push(
        or(
          like(users.username, `%${search}%`),
          like(users.fullName, `%${search}%`),
          like(users.email, `%${search}%`),
          like(users.nik, `%${search}%`)
        )
      );
    }

    // Add condition to exclude soft-deleted records
    whereConditions.push(isNull(users.deletedAt));

    const where = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const [usersData, totalResult] = await Promise.all([
      db.select({
        id: users.id,
        username: users.username,
        email: users.email,
        fullName: users.fullName,
        nik: users.nik,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
        .from(users)
        .where(where)
        .limit(limit)
        .offset(skip)
        .orderBy(desc(users.createdAt)),
      db.select({ count: count() }).from(users).where(where),
    ]);

    const total = totalResult[0]?.count || 0;

    return c.json({
      result: usersData,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return c.json({ message: "Internal server error" }, 500);
  }
});

// Get user by ID - accessible by both admin and user roles
usersRoute.get("/:id", roleValidationMiddleware(["admin", "user"]), async (c) => {
  try {
    const id = c.req.param("id");

    const userResult = await db.select({
      id: users.id,
      username: users.username,
      email: users.email,
      fullName: users.fullName,
      nik: users.nik,
      role: users.role,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
      .from(users)
      .where(and(eq(users.id, id), isNull(users.deletedAt)))
      .limit(1);

    const user = userResult[0];

    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    return c.json({ result: user });
  } catch (error) {
    return c.json({ message: "Internal server error" }, 500);
  }
});

// Create user - only accessible by admin role
usersRoute.post("/", roleValidationMiddleware(["admin"]), async (c) => {
  try {
    const body = await c.req.json();
    const data = userSchema.parse(body);

    // Check if username already exists (excluding soft-deleted)
    const existingUser = await db.select().from(users).where(and(eq(users.username, data.username), isNull(users.deletedAt))).limit(1);

    if (existingUser.length > 0) {
      return c.json({ message: "Username already exists" }, 400);
    }

    // Check if email already exists (if provided, excluding soft-deleted)
    if (data.email) {
      const existingEmail = await db.select().from(users).where(and(eq(users.email, data.email), isNull(users.deletedAt))).limit(1);

      if (existingEmail.length > 0) {
        return c.json({ message: "Email already exists" }, 400);
      }
    }

    // Generate a random password for new users
    const randomPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await Bun.password.hash(data?.password || randomPassword);

    const [user] = await db.insert(users).values({
      ...data,
      password: hashedPassword,
    }).returning({
      id: users.id,
      username: users.username,
      email: users.email,
      fullName: users.fullName,
      nik: users.nik,
      role: users.role,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    });

    return c.json(
      {
        message: "User created successfully",
        user,
        temporaryPassword: randomPassword,
      },
      201
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json(
        { message: "validation_error", error: JSON.parse(error.message) },
        400
      );
    }
    return c.json({ message: "Internal server error" }, 500);
  }
});

// Update user - only accessible by admin role
usersRoute.put("/:id", roleValidationMiddleware(["admin"]), async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const data = userUpdateSchema.parse(body);

    // Check if email already exists (if provided, excluding soft-deleted)
    if (data.email) {
      const existingEmail = await db.select().from(users).where(and(eq(users.email, data.email), ne(users.id, id), isNull(users.deletedAt))).limit(1);

      if (existingEmail.length > 0) {
        return c.json({ error: "Email already exists" }, 400);
      }
    }

    // Handle password update - only hash if password is provided and not empty
    const updateData: any = { ...data };

    // Remove password from updateData if it's empty or undefined
    if (!updateData.password || updateData.password.trim() === "") {
      delete updateData.password;
    } else {
      // Hash the password only if it's provided and not empty
      const hashedPassword = await Bun.password.hash(updateData.password);
      updateData.password = hashedPassword;
    }

    const [user] = await db.update(users).set(updateData).where(eq(users.id, id)).returning({
      id: users.id,
      username: users.username,
      email: users.email,
      fullName: users.fullName,
      nik: users.nik,
      role: users.role,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    });

    return c.json({
      message: "User updated successfully",
      user,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ message: error.message }, 400);
    }
    return c.json({ message: "Internal server error" }, 500);
  }
});

// Delete user - only accessible by admin role (soft delete)
usersRoute.delete("/:id", roleValidationMiddleware(["admin"]), async (c) => {
  try {
    const id = c.req.param("id");

    // Check if user exists and get their role (excluding soft-deleted)
    const userResult = await db.select({
      id: users.id,
      role: users.role,
    })
      .from(users)
      .where(and(eq(users.id, id), isNull(users.deletedAt)))
      .limit(1);

    const user = userResult[0];

    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    // Prevent deletion of admin users
    if (user.role === "admin") {
      return c.json({ error: "Cannot delete admin users" }, 403);
    }

    await db.update(users)
      .set({ deletedAt: new Date() })
      .where(eq(users.id, id));

    return c.json({ message: "User deleted successfully" });
  } catch (error) {
    return c.json({ message: "Internal server error" }, 500);
  }
});

export { usersRoute as users };
