import { SignJWT, jwtVerify } from "jose";
import type { User } from "./schema-pengamanan";

// JWT Configuration
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-change-in-production"
);
const JWT_ALGORITHM = "HS256";

// Token expiration (24 hours)
const TOKEN_EXPIRY = "24h";

export interface JWTPayload {
  userId: string;
  username: string;
  role: "superadmin" | "admin";
  iat?: number;
  exp?: number;
}

/**
 * Generate JWT token for user
 */
export async function generateToken(user: User): Promise<string> {
  const payload: JWTPayload = {
    userId: user.id,
    username: user.username,
    role: user.role,
  };

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: JWT_ALGORITHM })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(JWT_SECRET);

  return token;
}

/**
 * Verify and decode JWT token
 */
export async function verifyToken(token: string): Promise<JWTPayload> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as JWTPayload;
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
}

/**
 * Extract token from Authorization header
 * Format: "Bearer <token>"
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.substring(7);
}

/**
 * Hash password using Bun's built-in password hashing
 */
export async function hashPassword(password: string): Promise<string> {
  return await Bun.password.hash(password);
}

/**
 * Verify password against hash
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return await Bun.password.verify(password, hash);
}

/**
 * Type guard to check if user has superadmin role
 */
export function isSuperadmin(role: string): boolean {
  return role === "superadmin";
}

/**
 * Type guard to check if user has admin role
 */
export function isAdmin(role: string): boolean {
  return role === "admin" || role === "superadmin";
}
