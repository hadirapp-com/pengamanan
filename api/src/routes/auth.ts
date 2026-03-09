import { Hono } from "hono";
import { z } from "zod";
import { db } from "../lib/db";
import { users } from "../lib/schema";
import { eq, or } from "drizzle-orm";
import { generateTokens, verifyRefreshToken, verifyAccessToken } from "../lib/jwt";
import {
  loginSchema,
  registerSchema,
  sendVerificationEmailSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from "../schemas";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  verifyEmailConfig,
} from "../lib/email";

const authRoute = new Hono();

// Register user
authRoute.post("/register", async (c) => {
  try {
    const body = await c.req.json();
    const { username, password, email, fullName } = registerSchema.parse(body);

    const existingUser = await db.select().from(users).where(eq(users.username, username)).limit(1);

    if (existingUser.length > 0) {
      return c.json({ error: "Username already exists" }, 400);
    }

    const hashedPassword = await Bun.password.hash(password);

    const [user] = await db.insert(users).values({
      username,
      password: hashedPassword,
      email,
      fullName,
    }).returning();

    const { password: _, ...userWithoutPassword } = user;
    return c.json(
      {
        message: "User created successfully",
        user: userWithoutPassword,
      },
      201
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: error.message }, 400);
    }
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Login
authRoute.post("/login", async (c) => {
  try {
    const body = await c.req.json();
    const { username, password, source } = loginSchema.parse(body);

    const userResult = await db.select().from(users).where(eq(users.username, username)).limit(1);
    const user = userResult[0];

    if (!user) {
      return c.json({ error: "Username atau password salah" }, 401);
    }

    const isValidPassword = await Bun.password.verify(password, user.password);

    if (!isValidPassword) {
      return c.json({ error: "Username atau password salah" }, 401);
    }

    // Validate role + source combination
    const allowedWebRoles = ["admin", "sales", "supervisor", "production"];
    const allowedMobileRoles = ["preparation", "delivery"];

    if (source === "web" && !allowedWebRoles.includes(user.role)) {
      return c.json({
        error: `Akses ditolak, user ${user.role} tidak bisa login pada web`,
        allowedRoles: allowedWebRoles,
        userRole: user.role,
      }, 403);
    }

    if (source === "mobile" && !allowedMobileRoles.includes(user.role)) {
      return c.json({
        error: `Akses ditolak, user ${user.role} tidak bisa login pada mobile`,
        allowedRoles: allowedMobileRoles,
        userRole: user.role,
      }, 403);
    }

    const { accessToken, refreshToken } = await generateTokens(user.id);

    const { password: _, ...userWithoutPassword } = user;

    return c.json({
      message: "Login successful",
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error(error);
    if (error instanceof z.ZodError) {
      return c.json({ error: error.message }, 400);
    }
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Refresh token
authRoute.post("/refresh", async (c) => {
  try {
    const { refreshToken } = await c.req.json();

    if (!refreshToken) {
      return c.json({ error: "Refresh token is required" }, 400);
    }

    const payload = await verifyRefreshToken(refreshToken);

    if (!payload) {
      return c.json({ error: "Invalid refresh token" }, 401);
    }

    const userResult = await db.select().from(users).where(eq(users.id, payload.userId)).limit(1);
    const user = userResult[0];

    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    const { accessToken, refreshToken: newRefreshToken } = await generateTokens(
      user.id
    );

    return c.json({
      accessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Get current user data
authRoute.get("/me", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return c.json({ error: "Access token is required" }, 401);
    }

    const accessToken = authHeader.substring(7); // Remove "Bearer " prefix
    const payload = await verifyAccessToken(accessToken);

    if (!payload) {
      return c.json({ error: "Invalid access token" }, 401);
    }

    const userResult = await db.select().from(users).where(eq(users.id, payload.userId)).limit(1);
    const user = userResult[0];

    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    const { password: _, ...userWithoutPassword } = user;

    return c.json({
      user: userWithoutPassword,
    });
  } catch (error) {
    return c.json({ error: "Kesalahan internal server" }, 500);
  }
});

// Send email verification
authRoute.post("/send-verification-email", async (c) => {
  try {
    const body = await c.req.json();
    const { email } = sendVerificationEmailSchema.parse(body);

    // Check if user exists with this email
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (userResult.length === 0) {
      return c.json({ error: "Email tidak terdaftar" }, 404);
    }

    const user = userResult[0];

    // Check if email is already verified
    if (user.emailVerified) {
      return c.json({ message: "Email sudah diverifikasi" }, 200);
    }

    // Verify email configuration
    const emailConfigValid = await verifyEmailConfig();
    if (!emailConfigValid) {
      return c.json({
        error: "Konfigurasi email tidak valid. Silakan hubungi administrator."
      }, 500);
    }

    // Generate verification token
    const verificationToken = crypto.randomUUID();

    // Update user with verification token
    await db
      .update(users)
      .set({
        emailVerificationToken: verificationToken,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    // Send verification email
    const emailSent = await sendVerificationEmail(
      email,
      user.username || user.fullName || "Pengguna",
      verificationToken
    );

    if (!emailSent) {
      return c.json({
        error: "Gagal mengirim email verifikasi. Silakan coba lagi dalam beberapa saat."
      }, 500);
    }

    return c.json({
      message: "Email verifikasi telah dikirim. Silakan periksa inbox email Anda.",
      email: email,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: error.message }, 400);
    }
    return c.json({ error: "Kesalahan internal server" }, 500);
  }
});

// Verify email
authRoute.post("/verify-email", async (c) => {
  try {
    const body = await c.req.json();
    const { token } = verifyEmailSchema.parse(body);

    // Find user with this verification token
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.emailVerificationToken, token))
      .limit(1);

    if (userResult.length === 0) {
      return c.json({ error: "Token verifikasi tidak valid" }, 400);
    }

    const user = userResult[0];

    // Check if email is already verified
    if (user.emailVerified) {
      return c.json({ message: "Email sudah diverifikasi" }, 200);
    }

    // Verify email
    await db
      .update(users)
      .set({
        emailVerified: true,
        emailVerificationToken: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    return c.json({
      message: "Email berhasil diverifikasi",
      email: user.email,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: error.message }, 400);
    }
    return c.json({ error: "Kesalahan internal server" }, 500);
  }
});

// Forgot password - send reset email
authRoute.post("/forgot-password", async (c) => {
  try {
    const body = await c.req.json();
    const { email } = forgotPasswordSchema.parse(body);

    // Check if user exists with this email or username
    const userResult = await db
      .select()
      .from(users)
      .where(or(eq(users.email, email), eq(users.username, email)))
      .limit(1);

    if (userResult.length === 0) {
      // Don't reveal if email exists or not for security
      return c.json({
        message: "Jika email terdaftar, Anda akan menerima link reset password"
      }, 200);
    }

    const user = userResult[0];

    if (!user.email) {
      return c.json({
        message: "Akun Anda tidak memiliki email. Silakan hubungi administrator."
      }, 400);
    }

    // Verify email configuration
    const emailConfigValid = await verifyEmailConfig();
    if (!emailConfigValid) {
      return c.json({
        error: "Konfigurasi email tidak valid. Silakan hubungi administrator."
      }, 500);
    }

    // Generate reset token (expires in 1 hour)
    const resetToken = crypto.randomUUID();
    const resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Update user with reset token
    await db
      .update(users)
      .set({
        resetPasswordToken: resetToken,
        resetPasswordExpires,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    // Send password reset email
    const emailSent = await sendPasswordResetEmail(
      user.email,
      user.username || user.fullName || "Pengguna",
      resetToken
    );

    if (!emailSent) {
      return c.json({
        error: "Gagal mengirim email reset password. Silakan coba lagi dalam beberapa saat."
      }, 500);
    }

    return c.json({
      message: "Link reset password telah dikirim ke email Anda",
      email: user.email,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: error.message }, 400);
    }
    return c.json({ error: "Kesalahan internal server" }, 500);
  }
});

// Reset password
authRoute.post("/reset-password", async (c) => {
  try {
    const body = await c.req.json();
    const { token, newPassword } = resetPasswordSchema.parse(body);

    // Find user with this reset token
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.resetPasswordToken, token))
      .limit(1);

    if (userResult.length === 0) {
      return c.json({ error: "Token reset tidak valid" }, 400);
    }

    const user = userResult[0];

    // Check if token is expired
    if (!user.resetPasswordExpires || new Date() > user.resetPasswordExpires) {
      return c.json({
        error: "Token reset telah kedaluwarsa. Silakan request reset password kembali."
      }, 400);
    }

    // Hash new password
    const hashedPassword = await Bun.password.hash(newPassword);

    // Update password and clear reset token
    await db
      .update(users)
      .set({
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    return c.json({
      message: "Password berhasil direset. Silakan login dengan password baru.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: error.message }, 400);
    }
    return c.json({ error: "Kesalahan internal server" }, 500);
  }
});

// Change password - requires authentication
authRoute.post("/change-password", async (c) => {
  try {
    const body = await c.req.json();
    const { newPassword } = changePasswordSchema.parse(body);

    // Verify authentication
    const authHeader = c.req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return c.json({ error: "Token tidak ditemukan" }, 401);
    }

    const accessToken = authHeader.substring(7); // Remove "Bearer " prefix
    const payload = await verifyAccessToken(accessToken);

    if (!payload) {
      return c.json({ error: "Token tidak valid" }, 401);
    }

    // Hash the new password
    const hashedPassword = await Bun.password.hash(newPassword);

    // Update user's password
    await db
      .update(users)
      .set({
        password: hashedPassword,
        updatedAt: new Date(),
      })
      .where(eq(users.id, payload.userId));

    return c.json({
      message: "Password berhasil diubah",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: error.message }, 400);
    }
    return c.json({ error: "Kesalahan internal server" }, 500);
  }
});

export { authRoute as auth };
