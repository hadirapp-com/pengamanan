import { Hono } from "hono";
import { z } from "zod";
import { dbPengamanan } from "../lib/db-pengamanan";
import { users } from "../lib/schema-pengamanan";
import { eq } from "drizzle-orm";
import {
  generateToken,
  verifyPassword,
  hashPassword,
} from "../lib/auth-pengamanan";
import { authMiddleware } from "../middleware/auth-pengamanan";

const authRoutes = new Hono();

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, "Old password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

// ============================================================================
// ROUTES
// ============================================================================

/**
 * POST /auth/login
 * Login endpoint for superadmin and admin
 */
authRoutes.post("/login", async (c) => {
  try {
    const body = await c.req.json();
    const validationResult = loginSchema.safeParse(body);

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

    const { username, password } = validationResult.data;

    // Find user by username
    const userResult = await dbPengamanan
      .select({
        id: users.id,
        username: users.username,
        passwordHash: users.passwordHash,
        role: users.role,
        deletedAt: users.deletedAt,
      })
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (userResult.length === 0) {
      return c.json(
        {
          success: false,
          error: "Unauthorized",
          message: "Invalid username or password",
        },
        401
      );
    }

    const user = userResult[0];

    // Check if user is soft deleted
    if (user.deletedAt) {
      return c.json(
        {
          success: false,
          error: "Unauthorized",
          message: "User account has been deactivated",
        },
        401
      );
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return c.json(
        {
          success: false,
          error: "Unauthorized",
          message: "Invalid username or password",
        },
        401
      );
    }

    // Generate JWT token
    const token = await generateToken(user);

    // Return user info and token
    return c.json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return c.json(
      {
        success: false,
        error: "Internal Server Error",
        message: "An error occurred during login",
      },
      500
    );
  }
});

/**
 * GET /auth/me
 * Get current user info (requires authentication)
 */
authRoutes.get("/me", authMiddleware, async (c) => {
  const user = c.get("user");

  // Fetch full user info from database
  const userResult = await dbPengamanan
    .select({
      id: users.id,
      username: users.username,
      role: users.role,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .where(eq(users.id, user.userId))
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
});

/**
 * POST /auth/logout
 * Logout endpoint (client-side token removal)
 */
authRoutes.post("/logout", authMiddleware, async (c) => {
  // In a JWT-based system, logout is handled client-side by removing the token
  // If you want to implement server-side token invalidation, you would need:
  // 1. Token blacklist/whitelist
  // 2. Refresh token mechanism
  // 3. Token versioning in user record

  return c.json({
    success: true,
    message: "Logout successful",
  });
});

/**
 * POST /auth/change-password
 * Change password for logged in user
 */
authRoutes.post("/change-password", authMiddleware, async (c) => {
  try {
    const user = c.get("user");
    const body = await c.req.json();
    const validationResult = changePasswordSchema.safeParse(body);

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

    const { oldPassword, newPassword } = validationResult.data;

    // Get current user with password hash
    const userResult = await dbPengamanan
      .select({
        id: users.id,
        passwordHash: users.passwordHash,
      })
      .from(users)
      .where(eq(users.id, user.userId))
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

    const currentUser = userResult[0];

    // Verify old password
    const isOldPasswordValid = await verifyPassword(
      oldPassword,
      currentUser.passwordHash
    );
    if (!isOldPasswordValid) {
      return c.json(
        {
          success: false,
          error: "Unauthorized",
          message: "Current password is incorrect",
        },
        401
      );
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update password
    await dbPengamanan
      .update(users)
      .set({
        passwordHash: newPasswordHash,
        updatedAt: new Date(),
      })
      .where(eq(users.id, currentUser.id));

    return c.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    return c.json(
      {
        success: false,
        error: "Internal Server Error",
        message: "An error occurred while changing password",
      },
      500
    );
  }
});

export default authRoutes;
