import { Hono } from "hono";
import { z } from "zod";
import { db } from "../lib/db";
import { scanLogs, qrCodes, petugasJaga, posJaga } from "../lib/schema";
import { eq, and, desc, sql, gte, lte, or } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth";
import ExcelJS from "exceljs";

const logsRoutes = new Hono();

// Apply auth middleware to all routes
logsRoutes.use("/*", authMiddleware);

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const listLogsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(1000).default(50),
  dateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  dateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  posId: z.string().optional(),
  petugasId: z.string().optional(),
  tipeScan: z.enum(["masuk", "keluar"]).optional(),
});

// ============================================================================
// ROUTES
// ============================================================================

/**
 * GET /logs
 * List scan logs with filtering and pagination
 */
logsRoutes.get("/", async (c) => {
  try {
    const queryParams = c.req.query();
    const validationResult = listLogsSchema.safeParse(queryParams);

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

    const { page, limit, dateFrom, dateTo, posId, petugasId, tipeScan } = validationResult.data;
    const offset = (page - 1) * limit;

    // Build conditions
    const conditions = [];

    // Filter by date range
    if (dateFrom) {
      const fromDateTime = new Date(dateFrom);
      fromDateTime.setHours(0, 0, 0, 0);
      conditions.push(gte(scanLogs.scannedAt, fromDateTime));
    }
    if (dateTo) {
      const toDateTime = new Date(dateTo);
      toDateTime.setHours(23, 59, 59, 999);
      conditions.push(lte(scanLogs.scannedAt, toDateTime));
    }

    // Filter by pos
    if (posId) {
      conditions.push(eq(scanLogs.posId, posId));
    }

    // Filter by petugas
    if (petugasId) {
      conditions.push(eq(scanLogs.petugasId, petugasId));
    }

    // Filter by tipe scan
    if (tipeScan) {
      conditions.push(eq(scanLogs.tipeScan, tipeScan));
    }

    // Combine all conditions with AND
    const whereClause =
      conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const totalCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(scanLogs)
      .where(whereClause);

    const totalCount = totalCountResult[0]?.count || 0;
    const totalPages = Math.ceil(totalCount / limit);

    // Get scan logs with related data
    const logsList = await db
      .select({
        id: scanLogs.id,
        qrId: scanLogs.qrId,
        petugasId: scanLogs.petugasId,
        posId: scanLogs.posId,
        tipeScan: scanLogs.tipeScan,
        scannedAt: scanLogs.scannedAt,
        syncedAt: scanLogs.syncedAt,
        createdAt: scanLogs.createdAt,
        // Related data
        qrCode: qrCodes.qrCode,
        qrNama: qrCodes.nama,
        qrPenanggungJawab: qrCodes.penanggungJawab,
        petugasNama: petugasJaga.nama,
        posNama: posJaga.nama,
      })
      .from(scanLogs)
      .innerJoin(qrCodes, eq(scanLogs.qrId, qrCodes.id))
      .innerJoin(petugasJaga, eq(scanLogs.petugasId, petugasJaga.id))
      .innerJoin(posJaga, eq(scanLogs.posId, posJaga.id))
      .where(whereClause)
      .orderBy(desc(scanLogs.scannedAt))
      .limit(limit)
      .offset(offset);

    return c.json({
      success: true,
      data: logsList,
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
    console.error("List logs error:", error);
    return c.json(
      {
        success: false,
        error: "Internal Server Error",
        message: "An error occurred while fetching logs",
      },
      500
    );
  }
});

/**
 * GET /logs/stats
 * Get dashboard statistics
 */
logsRoutes.get("/stats", async (c) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's counts
    const todayStatsResult = await db
      .select({
        tipeScan: scanLogs.tipeScan,
        count: sql<number>`cast(count(*) as integer)`,
      })
      .from(scanLogs)
      .where(gte(scanLogs.scannedAt, today))
      .groupBy(scanLogs.tipeScan);

    const todayStats = {
      masuk: 0,
      keluar: 0,
    };

    for (const stat of todayStatsResult) {
      if (stat.tipeScan === "masuk") {
        todayStats.masuk = Number(stat.count);
      } else if (stat.tipeScan === "keluar") {
        todayStats.keluar = Number(stat.count);
      }
    }

    // Get last 7 days stats
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const last7DaysResult = await db
      .select({
        date: sql<string>`date(${scanLogs.scannedAt})`,
        tipeScan: scanLogs.tipeScan,
        count: sql<number>`cast(count(*) as integer)`,
      })
      .from(scanLogs)
      .where(gte(scanLogs.scannedAt, sevenDaysAgo))
      .groupBy(sql`date(${scanLogs.scannedAt})`, scanLogs.tipeScan)
      .orderBy(sql`date(${scanLogs.scannedAt})`);

    // Format last 7 days data
    const last7DaysData: Array<{
      date: string;
      masuk: number;
      keluar: number;
    }> = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];

      const dayData = last7DaysResult.filter((row) => row.date === dateStr);
      const masukCount = dayData.find((row) => row.tipeScan === "masuk")?.count || 0;
      const keluarCount = dayData.find((row) => row.tipeScan === "keluar")?.count || 0;

      last7DaysData.push({
        date: dateStr,
        masuk: masukCount,
        keluar: keluarCount,
      });
    }

    // Get last 10 scans
    const recentScans = await db
      .select({
        id: scanLogs.id,
        qrNama: qrCodes.nama,
        qrPenanggungJawab: qrCodes.penanggungJawab,
        petugasNama: petugasJaga.nama,
        posNama: posJaga.nama,
        tipeScan: scanLogs.tipeScan,
        scannedAt: scanLogs.scannedAt,
      })
      .from(scanLogs)
      .innerJoin(qrCodes, eq(scanLogs.qrId, qrCodes.id))
      .innerJoin(petugasJaga, eq(scanLogs.petugasId, petugasJaga.id))
      .innerJoin(posJaga, eq(scanLogs.posId, posJaga.id))
      .orderBy(desc(scanLogs.scannedAt))
      .limit(10);

    return c.json({
      success: true,
      data: {
        today: todayStats,
        last7Days: last7DaysData,
        recentScans,
      },
    });
  } catch (error) {
    console.error("Get stats error:", error);
    return c.json(
      {
        success: false,
        error: "Internal Server Error",
        message: "An error occurred while fetching statistics",
      },
      500
    );
  }
});

/**
 * GET /logs/export
 * Export logs to Excel
 */
logsRoutes.get("/export", async (c) => {
  try {
    const queryParams = c.req.query();
    const validationResult = listLogsSchema.safeParse(queryParams);

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

    const { dateFrom, dateTo, posId, petugasId, tipeScan } = validationResult.data;

    // Build conditions (same as list endpoint)
    const conditions = [];

    if (dateFrom) {
      const fromDateTime = new Date(dateFrom);
      fromDateTime.setHours(0, 0, 0, 0);
      conditions.push(gte(scanLogs.scannedAt, fromDateTime));
    }
    if (dateTo) {
      const toDateTime = new Date(dateTo);
      toDateTime.setHours(23, 59, 59, 999);
      conditions.push(lte(scanLogs.scannedAt, toDateTime));
    }
    if (posId) {
      conditions.push(eq(scanLogs.posId, posId));
    }
    if (petugasId) {
      conditions.push(eq(scanLogs.petugasId, petugasId));
    }
    if (tipeScan) {
      conditions.push(eq(scanLogs.tipeScan, tipeScan));
    }

    const whereClause =
      conditions.length > 0 ? and(...conditions) : undefined;

    // Get all matching logs (no pagination for export)
    const logsList = await db
      .select({
        qrNama: qrCodes.nama,
        qrPenanggungJawab: qrCodes.penanggungJawab,
        petugasNama: petugasJaga.nama,
        posNama: posJaga.nama,
        tipeScan: scanLogs.tipeScan,
        scannedAt: scanLogs.scannedAt,
        syncedAt: scanLogs.syncedAt,
      })
      .from(scanLogs)
      .innerJoin(qrCodes, eq(scanLogs.qrId, qrCodes.id))
      .innerJoin(petugasJaga, eq(scanLogs.petugasId, petugasJaga.id))
      .innerJoin(posJaga, eq(scanLogs.posId, posJaga.id))
      .where(whereClause)
      .orderBy(desc(scanLogs.scannedAt));

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Scan Logs");

    // Define columns
    worksheet.columns = [
      { header: "No", key: "no", width: 5 },
      { header: "Waktu Scan", key: "scannedAt", width: 20 },
      { header: "Nama QR", key: "qrNama", width: 20 },
      { header: "Penanggung Jawab", key: "qrPenanggungJawab", width: 25 },
      { header: "Tipe", key: "tipeScan", width: 10 },
      { header: "Petugas Jaga", key: "petugasNama", width: 20 },
      { header: "Pos Jaga", key: "posNama", width: 20 },
      { header: "Sync Time", key: "syncedAt", width: 20 },
    ];

    // Style the header row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF060273" },
    };
    headerRow.alignment = { horizontal: "center" };

    // Add data rows
    logsList.forEach((log, index) => {
      worksheet.addRow({
        no: index + 1,
        scannedAt: new Date(log.scannedAt).toLocaleString("id-ID"),
        qrNama: log.qrNama,
        qrPenanggungJawab: log.qrPenanggungJawab,
        tipeScan: log.tipeScan === "masuk" ? "MASUK" : "KELUAR",
        petugasNama: log.petugasNama,
        posNama: log.posNama,
        syncedAt: log.syncedAt ? new Date(log.syncedAt).toLocaleString("id-ID") : "-",
      });
    });

    // Auto-fit columns
    worksheet.columns.forEach((column) => {
      if (column.eachCell) {
        let maxLength = 0;
        column.eachCell({ includeEmpty: true }, (cell) => {
          const length = cell.value ? cell.value.toString().length : 10;
          if (length > maxLength) {
            maxLength = length;
          }
        });
        column.width = maxLength < 10 ? 10 : maxLength + 2;
      }
    });

    // Generate Excel buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Return Excel file
    return new Response(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="scan-logs-${Date.now()}.xlsx"`,
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Export logs error:", error);
    return c.json(
      {
        success: false,
        error: "Internal Server Error",
        message: "An error occurred while exporting logs",
      },
      500
    );
  }
});

export default logsRoutes;
