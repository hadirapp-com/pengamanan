import { SignJWT, jwtVerify } from "jose";
import type { User, PetugasJaga } from "./schema";

// JWT Configuration
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-change-in-production"
);
const JWT_ALGORITHM = "HS256";

// Token expiration (24 hours for web admin)
const TOKEN_EXPIRY = "24h";

const REFRESH_TOKEN_EXPIRY = "7d";

// Mobile token expiration (3 months)
const MOBILE_TOKEN_EXPIRY = "90d";

export interface JWTPayload {
  userId: string;
  username: string;
  role: "superadmin" | "admin";
  iat?: number;
  exp?: number;
}

export interface MobileJWTPayload {
  petugasId: string;
  nama: string;
  type: "mobile";
  iat?: number;
  exp?: number;
}

/**
 * Generate JWT token for user
 */
export async function generateToken(user: User): Promise<{accessToken: string, refreshToken: string}> {
  const payload: JWTPayload = {
    userId: user.id,
    username: user.username,
    role: user.role,
  };

  const accessToken = await new SignJWT(payload)
    .setProtectedHeader({ alg: JWT_ALGORITHM })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(JWT_SECRET);

  const refreshToken = await new SignJWT(payload)
    .setProtectedHeader({ alg: JWT_ALGORITHM })
    .setIssuedAt()
    .setExpirationTime(REFRESH_TOKEN_EXPIRY)
    .sign(JWT_SECRET);

  return { accessToken, refreshToken };
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

// ============================================================================
// MOBILE AUTHENTICATION (PIN-based)
// ============================================================================

/**
 * Generate JWT token for mobile app (3 months expiry)
 */
export async function generateMobileToken(petugas: PetugasJaga): Promise<string> {
  const payload: MobileJWTPayload = {
    petugasId: petugas.id,
    nama: petugas.nama,
    type: "mobile",
  };

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: JWT_ALGORITHM })
    .setIssuedAt()
    .setExpirationTime(MOBILE_TOKEN_EXPIRY)
    .sign(JWT_SECRET);

  return token;
}

/**
 * Verify and decode mobile JWT token
 */
export async function verifyMobileToken(token: string): Promise<MobileJWTPayload> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);

    // Verify this is a mobile token
    if ((payload.type as string) !== "mobile") {
      throw new Error("Invalid token type");
    }

    return payload as MobileJWTPayload;
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
}

/**
 * Verify PIN against hash using Bun's password hashing
 */
export async function verifyPin(pin: string, hash: string | null): Promise<boolean> {
  if (!hash) {
    return false;
  }
  return await Bun.password.verify(pin, hash);
}

/**
 * Hash PIN for storage
 */
export async function hashPin(pin: string): Promise<string> {
  return await Bun.password.hash(pin);
}
