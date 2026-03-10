import { Hono } from "hono";
import { z } from "zod";
import { db } from "../lib/db";
import { configs, petugasJaga, posJaga, qrCodes, pengumuman, scanLogs, pengumumanReads } from "../lib/schema";
import { eq, and, desc, sql, inArray } from "drizzle-orm";
import { verifyPin, generateMobileToken } from "../lib/auth";
import { mobileAuthMiddleware } from "../middleware/auth";

const mobileRoutes = new Hono();

// ============================================================================
// ROUTES REQUIRING AUTHENTICATION
// ============================================================================

// Protected routes (require mobile JWT)
const protectedMobileRoutes = new Hono();
protectedMobileRoutes.use("/*", mobileAuthMiddleware);

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const pinAuthSchema = z.object({
  pin: z.string().regex(/^\d{6}$/, "PIN must be 6 digits"),
});

const syncLogsSchema = z.object({
  logs: z.array(z.object({
    qrCode: z.string().min(1, "QR code is required"),
    petugasId: z.string().min(1, "Petugas ID is required"),
    posId: z.string().min(1, "Pos ID is required"),
    tipeScan: z.enum(["masuk", "keluar"]),
    scannedAt: z.string().datetime(),
  })).min(1, "At least one log is required").max(100, "Cannot sync more than 100 logs at once"),
});

const markReadSchema = z.object({
  pengumumanIds: z.array(z.string()).min(1, "At least one pengumuman ID is required"),
  deviceId: z.string().min(1, "Device ID is required"),
});

// ============================================================================
// ROUTES
// ============================================================================

/**
 * POST /mobile/auth/pin
 * Authenticate with PIN and return JWT token (valid for 3 months)
 * This is a public endpoint for mobile app authentication
 * PIN is global (stored in configs table), not per petugas
 */
mobileRoutes.post("/auth/pin", async (c) => {
  try {
    const body = await c.req.json();
    const validationResult = pinAuthSchema.safeParse(body);

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

    const { pin } = validationResult.data;

    // Get global PIN from configs table
    const configResult = await db
      .select({
        value: configs.value,
        isActive: configs.isActive,
      })
      .from(configs)
      .where(eq(configs.key, "mobile_pin"))
      .limit(1);

    if (configResult.length === 0 || !configResult[0].isActive) {
      return c.json(
        {
          success: false,
          error: "Configuration Error",
          message: "Mobile PIN not configured",
        },
        500
      );
    }

    const config = configResult[0];

    // Verify PIN against hashed PIN from configs
    const isValidPin = await verifyPin(pin, config.value);

    if (!isValidPin) {
      return c.json(
        {
          success: false,
          error: "Authentication Failed",
          message: "Invalid PIN",
        },
        401
      );
    }

    // Get first active petugas for token generation
    const petugasResult = await db
      .select({
        id: petugasJaga.id,
        nama: petugasJaga.nama,
      })
      .from(petugasJaga)
      .where(eq(petugasJaga.isActive, true))
      .limit(1);

    if (petugasResult.length === 0) {
      return c.json(
        {
          success: false,
          error: "Configuration Error",
          message: "No active petugas found",
        },
        500
      );
    }

    const petugas = petugasResult[0];

    // Generate JWT token valid for 3 months
    const token = await generateMobileToken(petugas);

    return c.json({
      success: true,
      data: {
        token,
        expiresIn: "3 months",
        petugas: {
          id: petugas.id,
          nama: petugas.nama,
        },
      },
    });
  } catch (error) {
    console.error("PIN auth error:", error);
    return c.json(
      {
        success: false,
        error: "Internal Server Error",
        message: "An error occurred during authentication",
      },
      500
    );
  }
});

/**
 * GET /mobile/sync
 * Get all master data for mobile sync (requires JWT auth)
 */
protectedMobileRoutes.get("/sync", async (c) => {
  try {
    // Get all active petugas jaga
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
      .where(eq(petugasJaga.isActive, true))
      .orderBy(petugasJaga.nama);

    // Get all active pos jaga
    const posList = await db
      .select({
        id: posJaga.id,
        nama: posJaga.nama,
        lokasi: posJaga.lokasi,
        isActive: posJaga.isActive,
        createdAt: posJaga.createdAt,
        updatedAt: posJaga.updatedAt,
      })
      .from(posJaga)
      .where(eq(posJaga.isActive, true))
      .orderBy(posJaga.nama);

    // Get all active QR codes with valid validity period
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const qrList = await db
      .select({
        id: qrCodes.id,
        qrCode: qrCodes.qrCode,
        nama: qrCodes.nama,
        penanggungJawab: qrCodes.penanggungJawab,
        validFrom: qrCodes.validFrom,
        validUntil: qrCodes.validUntil,
        isActive: qrCodes.isActive,
        createdAt: qrCodes.createdAt,
        updatedAt: qrCodes.updatedAt,
      })
      .from(qrCodes)
      .where(
        and(
          eq(qrCodes.isActive, true),
          sql`${qrCodes.validFrom} <= ${today}`,
          sql`${qrCodes.validUntil} >= ${today}`
        )
      )
      .orderBy(qrCodes.nama);

    // Get 10 latest active pengumuman
    const pengumumanList = await db
      .select({
        id: pengumuman.id,
        title: pengumuman.title,
        content: pengumuman.content,
        priority: pengumuman.priority,
        isActive: pengumuman.isActive,
        createdAt: pengumuman.createdAt,
        updatedAt: pengumuman.updatedAt,
      })
      .from(pengumuman)
      .where(eq(pengumuman.isActive, true))
      .orderBy(desc(pengumuman.createdAt))
      .limit(10);

    return c.json({
      success: true,
      data: {
        petugasJaga: petugasList,
        posJaga: posList,
        qrCodes: qrList,
        pengumuman: pengumumanList,
        syncedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Mobile sync error:", error);
    return c.json(
      {
        success: false,
        error: "Internal Server Error",
        message: "An error occurred during sync",
      },
      500
    );
  }
});

/**
 * POST /mobile/sync-logs
 * Receive scan logs from mobile (requires JWT auth)
 */
protectedMobileRoutes.post("/sync-logs", async (c) => {
  try {
    const body = await c.req.json();
    const validationResult = syncLogsSchema.safeParse(body);

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

    const { logs } = validationResult.data;

    // Array to store successful insertions
    const syncedLogs: string[] = [];
    const failedLogs: Array<{ index: number; qrCode: string; error: string }> = [];

    // Process each log
    for (let i = 0; i < logs.length; i++) {
      const log = logs[i];

      try {
        // Validate QR code exists and is active
        const qrResult = await db
          .select({ id: qrCodes.id })
          .from(qrCodes)
          .where(
            and(
              eq(qrCodes.qrCode, log.qrCode),
              eq(qrCodes.isActive, true)
            )
          )
          .limit(1);

        if (qrResult.length === 0) {
          failedLogs.push({
            index: i,
            qrCode: log.qrCode,
            error: "QR code not found or inactive",
          });
          continue;
        }

        const qrId = qrResult[0].id;

        // Validate petugas exists
        const petugasResult = await db
          .select({ id: petugasJaga.id })
          .from(petugasJaga)
          .where(eq(petugasJaga.id, log.petugasId))
          .limit(1);

        if (petugasResult.length === 0) {
          failedLogs.push({
            index: i,
            qrCode: log.qrCode,
            error: "Petugas not found",
          });
          continue;
        }

        // Validate pos exists
        const posResult = await db
          .select({ id: posJaga.id })
          .from(posJaga)
          .where(eq(posJaga.id, log.posId))
          .limit(1);

        if (posResult.length === 0) {
          failedLogs.push({
            index: i,
            qrCode: log.qrCode,
            error: "Pos not found",
          });
          continue;
        }

        // Insert scan log
        const scannedAt = new Date(log.scannedAt);
        const newLogResult = await db
          .insert(scanLogs)
          .values({
            qrId,
            petugasId: log.petugasId,
            posId: log.posId,
            tipeScan: log.tipeScan,
            scannedAt,
            syncedAt: new Date(),
          })
          .returning({ id: scanLogs.id });

        syncedLogs.push(newLogResult[0].id);
      } catch (error) {
        failedLogs.push({
          index: i,
          qrCode: log.qrCode,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return c.json({
      success: true,
      message: "Logs processed",
      data: {
        synced: syncedLogs.length,
        failed: failedLogs.length,
        failedLogs,
      },
    });
  } catch (error) {
    console.error("Sync logs error:", error);
    return c.json(
      {
        success: false,
        error: "Internal Server Error",
        message: "An error occurred while syncing logs",
      },
      500
    );
  }
});

/**
 * POST /mobile/read-announce
 * Mark pengumuman as read (requires JWT auth)
 */
protectedMobileRoutes.post("/read-announce", async (c) => {
  try {
    const body = await c.req.json();
    const validationResult = markReadSchema.safeParse(body);

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

    const { pengumumanIds, deviceId } = validationResult.data;

    const markedCount = await db
      .insert(pengumumanReads)
      .values(
        pengumumanIds.map((pengumumanId) => ({
          pengumumanId,
          deviceId,
        }))
      )
      .onConflictDoNothing();

    return c.json({
      success: true,
      message: "Pengumuman marked as read",
      data: {
        markedCount: pengumumanIds.length,
      },
    });
  } catch (error) {
    console.error("Mark pengumuman read error:", error);
    return c.json(
      {
        success: false,
        error: "Internal Server Error",
        message: "An error occurred while marking pengumuman as read",
      },
      500
    );
  }
});

/**
 * GET /mobile/pengumuman
 * Get 10 latest active pengumuman (requires JWT auth)
 */
protectedMobileRoutes.get("/pengumuman", async (c) => {
  try {
    const pengumumanList = await db
      .select({
        id: pengumuman.id,
        title: pengumuman.title,
        content: pengumuman.content,
        priority: pengumuman.priority,
        createdAt: pengumuman.createdAt,
        updatedAt: pengumuman.updatedAt,
      })
      .from(pengumuman)
      .where(eq(pengumuman.isActive, true))
      .orderBy(desc(pengumuman.createdAt))
      .limit(10);

    return c.json({
      success: true,
      data: pengumumanList,
    });
  } catch (error) {
    console.error("Get pengumuman for mobile error:", error);
    return c.json(
      {
        success: false,
        error: "Internal Server Error",
        message: "An error occurred while fetching pengumuman",
      },
      500
    );
  }
});

// Mount protected routes
mobileRoutes.route("/", protectedMobileRoutes);

export default mobileRoutes;
