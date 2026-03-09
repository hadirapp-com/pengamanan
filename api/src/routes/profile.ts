import { Hono } from "hono";
import { z } from "zod";
import { db } from "../lib/db";
import { users } from "../lib/schema";
import { eq, and, isNull } from "drizzle-orm";
import { verifyAccessToken } from "../lib/jwt";
import {
  profileEmailSchema,
  profileEmailVerifySchema,
} from "../schemas";
import {
  sendVerificationEmail,
  verifyEmailConfig,
} from "../lib/email";

const profileRoute = new Hono();

// Helper function to verify authentication and get user
const getAuthenticatedUser = async (c: any) => {
  const authHeader = c.req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const accessToken = authHeader.substring(7);
  const payload = await verifyAccessToken(accessToken);

  if (!payload) {
    return null;
  }

  return payload.userId;
};

// Send verification email to update/add email
profileRoute.post("/email", async (c) => {
  try {
    const body = await c.req.json();
    const { email } = profileEmailSchema.parse(body);

    // Get authenticated user
    const userId = await getAuthenticatedUser(c);

    if (!userId) {
      return c.json({ error: "Token tidak ditemukan atau tidak valid" }, 401);
    }

    // Check if email is already used by another user
    const existingEmailUsers = await db
      .select()
      .from(users)
      .where(and(eq(users.email, email), isNull(users.deletedAt)))
      .limit(1);

    if (existingEmailUsers.length > 0 && existingEmailUsers[0].id !== userId) {
      return c.json({ error: "Email sudah digunakan oleh user lain" }, 400);
    }

    // Verify email configuration
    const emailConfigValid = await verifyEmailConfig();
    if (!emailConfigValid) {
      return c.json({
        error: "Konfigurasi email tidak valid. Silakan hubungi administrator."
      }, 500);
    }

    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Update user with verification code (temporarily store the new email)
  await db
      .update(users)
      .set({
        emailVerificationToken: verificationCode,
        emailVerified: false,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    // Send verification email
    const emailSent = await sendVerificationEmail(
      email,
      "User",
      verificationCode,
      true
    );

    if (!emailSent) {
      return c.json({
        error: "Gagal mengirim email verifikasi. Silakan coba lagi dalam beberapa saat."
      }, 500);
    }

    return c.json({
      message: "Email verifikasi telah dikirim. Silakan periksa inbox email Anda.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: error.message }, 400);
    }
    console.error("Error sending verification email:", error);
    return c.json({ error: "Kesalahan internal server" }, 500);
  }
});

// Verify email with code
profileRoute.post("/email/verify", async (c) => {
  try {
    const body = await c.req.json();
    const { email, code } = profileEmailVerifySchema.parse(body);

    // Get authenticated user
    const userId = await getAuthenticatedUser(c);

    if (!userId) {
      return c.json({ error: "Token tidak ditemukan atau tidak valid" }, 401);
    }

    // Get user with verification code
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    const user = userResult[0];

    if (!user) {
      return c.json({ error: "User tidak ditemukan" }, 404);
    }

    // Verify the code matches
    if (user.emailVerificationToken !== code) {
      return c.json({ error: "Kode verifikasi tidak valid" }, 400);
    }

    // Check if email is already used by another user
    const existingEmailUsers = await db
      .select()
      .from(users)
      .where(and(eq(users.email, email), isNull(users.deletedAt)))
      .limit(1);

    if (existingEmailUsers.length > 0 && existingEmailUsers[0].id !== userId) {
      return c.json({ error: "Email sudah digunakan oleh user lain" }, 400);
    }

    // Update user's email and mark as verified
    await db
      .update(users)
      .set({
        email: email,
        emailVerified: true,
        emailVerificationToken: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    // Return updated user without password
    const { password: _, ...userWithoutPassword } = user;

    return c.json({
      message: "Email berhasil diverifikasi",
      user: {
        ...userWithoutPassword,
        email: email,
        emailVerified: true,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: error.message }, 400);
    }
    console.error("Error verifying email:", error);
    return c.json({ error: "Kesalahan internal server" }, 500);
  }
});

// Resend verification code
profileRoute.post("/email/resend", async (c) => {
  try {
    const body = await c.req.json();
    const { email } = profileEmailSchema.parse(body);

    // Get authenticated user
    const userId = await getAuthenticatedUser(c);

    if (!userId) {
      return c.json({ error: "Token tidak ditemukan atau tidak valid" }, 401);
    }

    // Get user
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    const user = userResult[0];

    if (!user) {
      return c.json({ error: "User tidak ditemukan" }, 404);
    }

    // Verify email configuration
    const emailConfigValid = await verifyEmailConfig();
    if (!emailConfigValid) {
      return c.json({
        error: "Konfigurasi email tidak valid. Silakan hubungi administrator."
      }, 500);
    }

    // Generate new 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Update user with new verification code
    await db
      .update(users)
      .set({
        emailVerificationToken: verificationCode,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    // Send verification email
    const emailSent = await sendVerificationEmail(
      email,
      user.username || user.fullName || "Pengguna",
      verificationCode
    );

    if (!emailSent) {
      return c.json({
        error: "Gagal mengirim email verifikasi. Silakan coba lagi dalam beberapa saat."
      }, 500);
    }

    return c.json({
      message: "Email verifikasi telah dikirim. Silakan periksa inbox email Anda.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: error.message }, 400);
    }
    console.error("Error resending verification email:", error);
    return c.json({ error: "Kesalahan internal server" }, 500);
  }
});

export { profileRoute as profile };
