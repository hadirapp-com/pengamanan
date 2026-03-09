import { Context, Next } from "hono";
import { verifyAccessToken } from "../lib/jwt";
import { db } from "../lib/db";
import { users } from "../lib/schema";
import { eq } from "drizzle-orm";

export const authMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ error: "Token tidak ditemukan" }, 401);
  }

  const token = authHeader.substring(7);
  const payload = await verifyAccessToken(token);

  if (!payload) {
    return c.json({ error: "Token tidak valid" }, 401);
  }

  c.set("userId", payload.userId);
  await next();
};

export const roleValidationMiddleware = (allowedRoles: string[]) => {
  return async (c: Context, next: Next) => {
    try {
      const userId = c.get("userId");

      if (!userId) {
        return c.json({ error: "User ID not found" }, 401);
      }

      const userResult = await db
        .select({
          role: users.role,
        })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      const user = userResult[0];

      if (!user) {
        return c.json({ error: "User not found" }, 404);
      }

      if (allowedRoles.includes("*")) {
        c.set("userRole", user.role);
        return await next();
      }

      if (!allowedRoles.includes(user.role)) {
        return c.json({ error: "Insufficient permissions" }, 403);
      }

      c.set("userRole", user.role);
      await next();
    } catch (error) {
      return c.json({ error: "Internal server error" }, 500);
    }
  };
};
