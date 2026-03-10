import type { Context, Next } from "hono";
import {
  verifyToken,
  extractTokenFromHeader,
  isSuperadmin,
  verifyMobileToken,
} from "../lib/auth-pengamanan";
import type { JWTPayload, MobileJWTPayload } from "../lib/auth-pengamanan";

/**
 * Extend Hono context with user payload
 */
declare module "hono" {
  interface ContextVariableMap {
    user: JWTPayload;
    mobileUser: MobileJWTPayload;
  }
}

/**
 * Authentication middleware
 * Verifies JWT token and attaches user payload to context
 */
export async function authMiddleware(c: Context, next: Next) {
  try {
    const authHeader = c.req.header("Authorization");
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return c.json(
        {
          success: false,
          error: "Unauthorized",
          message: "Missing or invalid authorization header",
        },
        401
      );
    }

    const payload = await verifyToken(token);
    c.set("user", payload);

    await next();
  } catch (error) {
    return c.json(
      {
        success: false,
        error: "Unauthorized",
        message: error instanceof Error ? error.message : "Invalid token",
      },
      401
    );
  }
}

/**
 * Superadmin-only middleware
 * Must be used after authMiddleware
 */
export async function superadminOnly(c: Context, next: Next) {
  const user = c.get("user");

  if (!isSuperadmin(user.role)) {
    return c.json(
      {
        success: false,
        error: "Forbidden",
        message: "This endpoint requires superadmin role",
      },
      403
    );
  }

  await next();
}

/**
 * Optional auth middleware
 * Attaches user payload if valid token exists, but doesn't block if not
 */
export async function optionalAuth(c: Context, next: Next) {
  try {
    const authHeader = c.req.header("Authorization");
    const token = extractTokenFromHeader(authHeader);

    if (token) {
      const payload = await verifyToken(token);
      c.set("user", payload);
    }
  } catch (error) {
    // Ignore errors - token is optional
  }

  await next();
}

// ============================================================================
// MOBILE AUTHENTICATION MIDDLEWARE
// ============================================================================

/**
 * Mobile authentication middleware
 * Verifies JWT token for mobile app and attaches petugas payload to context
 */
export async function mobileAuthMiddleware(c: Context, next: Next) {
  try {
    const authHeader = c.req.header("Authorization");
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return c.json(
        {
          success: false,
          error: "Unauthorized",
          message: "Missing or invalid authorization header",
        },
        401
      );
    }

    const payload = await verifyMobileToken(token);
    c.set("mobileUser", payload);

    await next();
  } catch (error) {
    return c.json(
      {
        success: false,
        error: "Unauthorized",
        message: error instanceof Error ? error.message : "Invalid or expired token",
      },
      401
    );
  }
}

/**
 * Optional mobile auth middleware
 * Attaches mobile user payload if valid token exists, but doesn't block if not
 */
export async function optionalMobileAuth(c: Context, next: Next) {
  try {
    const authHeader = c.req.header("Authorization");
    const token = extractTokenFromHeader(authHeader);

    if (token) {
      const payload = await verifyMobileToken(token);
      c.set("mobileUser", payload);
    }
  } catch (error) {
    // Ignore errors - token is optional
  }

  await next();
}
