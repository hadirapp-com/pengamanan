import { Hono } from "hono";
import { z } from "zod";
import { db } from "../lib/db";
import {
  deliveries,
  customers,
  users,
  scanLotStatus,
  configs,
  parts,
} from "../lib/schema";
import { eq, desc, and, count, sql, isNull, isNotNull, or, asc } from "drizzle-orm";
import { authMiddleware, roleValidationMiddleware } from "../middleware/auth";
import { addSuffix } from "../lib/utils";
import {
  deliverySchema,
  scanDeliverySchema,
  lotBypassSchema,
} from "../schemas";
import { snakeCase } from "change-case";
import * as XLSX from "xlsx";
import ExcelJS from "exceljs";
import { sendRevisionNotificationEmail } from "../lib/email";
import { createScanLog } from "../lib/log";

const deliveriesRoute = new Hono();

// Apply auth middleware to all routes
deliveriesRoute.use("*", authMiddleware);

deliveriesRoute.post("/check-scanned-barcode", async (c) => {
  const body = await c.req.json();
  console.log({ body });
  const { kasaiBarcode, userRole } = body;
  if (!kasaiBarcode || !userRole) {
    return c.json({ error: "Barcode Kasai & User Role wajib diisi" }, 400);
  }
  if (!["preparation", "delivery"].includes(userRole)) {
    return c.json({ error: "Role pengguna tidak valid untuk pemindaian" }, 403);
  }

  let scannedBefore;

  if (userRole === "preparation") {
    scannedBefore = await db
      .select()
      .from(deliveries)
      .where(
        and(
          eq(deliveries.barcodeKasai, kasaiBarcode),
          isNotNull(deliveries.scanLt1At),
        ),
      )
      .limit(1);
  } else {
    scannedBefore = await db
      .select()
      .from(deliveries)
      .where(
        and(
          eq(deliveries.barcodeKasai, kasaiBarcode),
          isNotNull(deliveries.scanLt2At),
        ),
      )
      .limit(1);
  }

  if (scannedBefore.length) {
    return c.json(
      { error: `QR ${kasaiBarcode} pernah discan sebelumnya!` },
      400,
    );
  }

  return c.json({
    message: "QR belum discan!",
  });
});

// New scan endpoint with 2-step barcode validation
deliveriesRoute.post("/scan-barcode", async (c) => {
  try {
    const body = await c.req.json();
    console.log("scan barcode", { body });
    const {
      customerBarcode,
      kasaiBarcode,
      customerId,
      lot,
      deliveryYear,
      userId,
      userName,
      userRole,
    } = body;

    // Validate required fields
    if (
      !customerBarcode ||
      !kasaiBarcode ||
      !customerId ||
      !lot ||
      !deliveryYear ||
      !userId ||
      !userRole
    ) {
      return c.json({ error: "Field wajib tidak lengkap" }, 400);
    }

    // Validate user role
    if (!["preparation", "delivery"].includes(userRole)) {
      return c.json(
        { error: "Role pengguna tidak valid untuk pemindaian" },
        403,
      );
    }

    // get HPM barcode
    const today = new Date();
    const fullYear = today.getFullYear().toString();
    const lastTwoDigits = fullYear.slice(-2);
    const prevYear = (parseInt(lastTwoDigits) - 1).toString();
    const years = [lastTwoDigits,  prevYear]
    let custBarcode = '';
    let ourBarcode = '';
    if (customerBarcode.length >= 23 && !!years.find(yr => (customerBarcode as string).startsWith(yr))){
      custBarcode = customerBarcode;
      ourBarcode = kasaiBarcode;
    } else {
      custBarcode = kasaiBarcode;
      ourBarcode = customerBarcode;
    }

    // check unique barcode
    if (ourBarcode) {
      let scannedBefore;

      if (userRole === "preparation") {
        scannedBefore = await db
          .select()
          .from(deliveries)
          .where(
            and(
              eq(deliveries.barcodeKasai, ourBarcode),
              isNotNull(deliveries.scanLt1At),
            ),
          )
          .limit(1);
      } else {
        scannedBefore = await db
          .select()
          .from(deliveries)
          .where(
            and(
              eq(deliveries.barcodeKasai, ourBarcode),
              isNotNull(deliveries.scanLt2At),
            ),
          )
          .limit(1);
      }

      if (scannedBefore.length) {
        // Check if scan was within 5 seconds (treat as double send from scanner)
        const lastScan = scannedBefore[0];
        const scanTime = userRole === "preparation" ? lastScan.scanLt1At : lastScan.scanLt2At;

        if (scanTime) {
          const timeDiff = Date.now() - new Date(scanTime).getTime();
          // 5 seconds in milliseconds = 5000
          if (timeDiff <= 5000) {
            // Treat as double send from scanner - return success
            return c.json({
              message: "Pemindaian berhasil",
              showAlert: false,
              delivery: lastScan,
              scanType: userRole,
              progress: {
                scanned: 0,
                total: 0,
                isCompleted: false,
              },
            });
          }
        }

        return c.json(
          { error: `QR ${ourBarcode} pernah discan sebelumnya!` },
          400,
        );
      }
    }

    // Check if there's an active lot lock for this role
    const statusColumn =
      userRole === "preparation"
        ? scanLotStatus.preparationStatus
        : scanLotStatus.deliveryStatus;

    const activeLocks = await db
      .select()
      .from(scanLotStatus)
      .where(eq(statusColumn, "in progress"))
      .limit(1);

    // If there's an active lock for a different lot, reject the scan
    if (activeLocks.length > 0 && activeLocks[0].kdLotNo !== lot) {
      // Get user info who holds the lock
      const lockedBy =
        userRole === "preparation"
          ? activeLocks[0].preparationBy
          : activeLocks[0].deliveryBy;

      const lockHolder = await db
        .select({
          id: users.id,
          fullName: users.fullName,
          username: users.username,
        })
        .from(users)
        .where(eq(users.id, lockedBy!))
        .limit(1);

      return c.json(
        {
          error: "Lot terkunci",
          message: `Lot ${activeLocks[0].kdLotNo} sedang aktif. Silakan selesaikan lot tersebut terlebih dahulu atau hubungi admin untuk membuka kunci.`,
          lockedLot: activeLocks[0].kdLotNo,
          lockedBy: lockHolder[0]
            ? {
                id: lockHolder[0].id,
                name: lockHolder[0].fullName || lockHolder[0].username,
              }
            : null,
        },
        409,
      );
    }

    let trimmedHpmBarcode = custBarcode;
    let deliveryResult;
    if (userRole === "preparation") {
      if (custBarcode.length > 23) {
        trimmedHpmBarcode = custBarcode.slice(0, 23);
      }
      const ksBc = ourBarcode.slice(0, -12).replace(/-/g, "");
      deliveryResult = await db
        .select()
        .from(deliveries)
        .where(
          and(
            eq(deliveries.remarksBawah, trimmedHpmBarcode),
            sql`REPLACE(${deliveries.partNumber}, '-', '') = ${ksBc}`,
            eq(deliveries.barcodeHpm, ""),
          ),
        )
        .limit(1);
    } else {
      const ksBc = ourBarcode.slice(0, -12).replace(/-/g, "");
      deliveryResult = await db
        .select()
        .from(deliveries)
        .where(and(
          eq(deliveries.barcodeHpm, custBarcode),
          sql`REPLACE(${deliveries.partNumber}, '-', '') = ${ksBc}`,
        ))
        .limit(1);
    }

    const delivery = deliveryResult?.[0];

    if (!delivery) {
       await createScanLog({
        scanType: userRole,
        customerId,
        lot,
        scanBy: userId,
        customerBarcode: custBarcode,
        kasaiBarcode: ourBarcode,
        deliveryYear,
        partName: null,
        partNumber: null,
        scanStatus: 'missmatch',
        deliveryId: null,
      });
      
      return c.json(
        {
          error: "Barcode tidak cocok",
          message:
            "Tidak ada pengiriman yang cocok dengan barcode yang diberikan",
          custBarcode,
          ourBarcode,
        },
        404,
      );
    }

    // Check if already scanned by this user
    if (userRole === "preparation" && delivery.scanLt1At != null) {
       await createScanLog({
        scanType: userRole,
        customerId,
        lot,
        scanBy: userId,
        customerBarcode: custBarcode,
        kasaiBarcode: ourBarcode,
        deliveryYear,
        partName: delivery.partName,
        partNumber: delivery.partNumber,
        scanStatus: 'double scan',
        deliveryId: delivery.id,
      });

      return c.json(
        {
          error: "Sudah dipindai",
          message: "Item ini sudah dipindai pada tahap preparation",
          delivery: {
            id: delivery.id,
            partName: delivery.partName,
          },
        },
        400,
      );
    }

    if (userRole === "delivery" && delivery.scanLt2At != null) {
      await createScanLog({
        scanType: userRole,
        customerId,
        lot,
        scanBy: userId,
        customerBarcode: custBarcode,
        kasaiBarcode: ourBarcode,
        deliveryYear,
        partName: delivery.partName,
        partNumber: delivery.partNumber,
        scanStatus: 'double scan',
        deliveryId: delivery.id,
      });
      
      return c.json(
        {
          error: "Sudah dipindai",
          message: "Item ini sudah dipindai pada tahap delivery",
          delivery: {
            id: delivery.id,
            partName: delivery.partName,
          },
        },
        400,
      );
    }

    // Determine which fields to update based on user role
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (userRole === "preparation") {
      updateData.scanLt1By = userId;
      updateData.scanLt1ByName = userName;
      updateData.scanLt1At = new Date();
      updateData.barcodeHpm = custBarcode;
      updateData.barcodeKasai = ourBarcode;
    } else if (userRole === "delivery") {
      updateData.scanLt2By = userId;
      updateData.scanLt2ByName = userName;
      updateData.scanLt2At = new Date();
    }

    // Get total items and scanned items count for this lot
    const scanColumn =
      userRole === "preparation" ? deliveries.scanLt1At : deliveries.scanLt2At;

    const lotStats = await db
      .select({
        totalItems: sql<number>`count(*)::int`,
        scannedItems: sql<number>`count(${scanColumn})::int`,
      })
      .from(deliveries)
      .where(
        and(
          eq(deliveries.kdLotNo, lot),
          eq(deliveries.customerId, customerId),
          eq(deliveries.deliveryYear, parseInt(deliveryYear)),
        ),
      )
      .limit(1);

    const stats = lotStats[0];
    const currentScannedCount = stats.scannedItems;
    const totalItems = stats.totalItems;

    // Update delivery
    const [updatedDelivery] = await db
      .update(deliveries)
      .set(updateData)
      .where(eq(deliveries.id, delivery.id))
      .returning();

    // Check if this is the first item scanned (before this update)
    if (currentScannedCount === 0) {
      // Create or update scan_lot_status entry for first item
      const existingStatus = await db
        .select()
        .from(scanLotStatus)
        .where(eq(scanLotStatus.kdLotNo, lot))
        .limit(1);

      if (existingStatus.length === 0) {
        // Insert new status
        const statusData: any = {
          kdLotNo: lot,
          customerId,
        };

        if (userRole === "preparation") {
          statusData.preparationStatus = "in progress";
          statusData.preparationBy = userId;
          statusData.preparationStartedAt = new Date();
        } else {
          statusData.deliveryStatus = "in progress";
          statusData.deliveryBy = userId;
          statusData.deliveryStartedAt = new Date();
        }

        await db.insert(scanLotStatus).values(statusData);
      } else {
        // Update existing status
        const statusUpdateData: any = {};

        if (userRole === "preparation") {
          statusUpdateData.preparationStatus = "in progress";
          statusUpdateData.preparationBy = userId;
          statusUpdateData.preparationStartedAt = new Date();
        } else {
          statusUpdateData.deliveryStatus = "in progress";
          statusUpdateData.deliveryBy = userId;
          statusUpdateData.deliveryStartedAt = new Date();
        }

        await db
          .update(scanLotStatus)
          .set(statusUpdateData)
          .where(eq(scanLotStatus.kdLotNo, lot));
      }
    }

    // Check if this is the last item (after this update, scannedCount = totalItems)
    if (currentScannedCount + 1 === totalItems) {
      // Update scan_lot_status to mark as completed
      const statusUpdateData: any = {};

      if (userRole === "preparation") {
        statusUpdateData.preparationStatus = "closed";
        statusUpdateData.preparationCompletedAt = new Date();
      } else {
        statusUpdateData.deliveryStatus = "closed";
        statusUpdateData.deliveryCompletedAt = new Date();
      }

      await db
        .update(scanLotStatus)
        .set(statusUpdateData)
        .where(eq(scanLotStatus.kdLotNo, lot));
    }

    return c.json({
      message: "Pemindaian berhasil",
      showAlert: true,
      delivery: updatedDelivery,
      scanType: userRole,
      progress: {
        scanned: currentScannedCount + 1,
        total: totalItems,
        isCompleted: currentScannedCount + 1 === totalItems,
      },
    });
  } catch (error) {
    console.error("Scan error:", error);
    return c.json({ error: "Kesalahan internal server" }, 500);
  }
});

deliveriesRoute.patch("/scan/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const data = scanDeliverySchema.parse(body);

    // Check if customer exists
    const customerResult = await db
      .select()
      .from(customers)
      .where(eq(customers.id, data.customerId))
      .limit(1);
    const customer = customerResult[0];

    if (!customer) {
      return c.json({ error: "Pelanggan tidak ditemukan" }, 404);
    }

    // Convert date strings to Date objects if provided
    const updateData: any = { ...data };
    if (data.scanLt1By) {
      updateData.scanLt1At = new Date();
    }
    if (data.scanLt2By) {
      updateData.scanLt2At = new Date();
    }

    const { customerId, ...rest } = updateData;

    const [delivery] = await db
      .update(deliveries)
      .set(rest)
      .where(eq(deliveries.id, id))
      .returning();

    return c.json({
      message: "Pengiriman berhasil diperbarui",
      delivery,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: error.message }, 400);
    }
    return c.json({ error: "Kesalahan internal server" }, 500);
  }
});

// Get HPM lot report - scan monitoring with scan status per part number
deliveriesRoute.get(
  "/hpm/lot",
  roleValidationMiddleware([
    "admin",
    "sales",
    "supervisor",
    "production",
    "preparation",
    "delivery",
  ]),
  async (c) => {
    try {
      const dateQuery = c.req.query("date");
      const lotQuery = c.req.query("lot");
      const statusQuery = c.req.query("status"); // "open", "in progress", "closed", or "all"

      // Validate required parameters
      if (!dateQuery) {
        return c.json({ error: "Tanggal diperlukan" }, 400);
      }

      // Validate date format (YYYY-MM-DD)
      const dateFormatRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateFormatRegex.test(dateQuery)) {
        return c.json(
          {
            error:
              "Format tanggal tidak valid. Gunakan format YYYY-MM-DD (contoh: 2025-05-01)",
          },
          400,
        );
      }

      // Convert input dates (YYYY-MM-DD) to database format (DD-MM-YY)
      const splitDate = (
        dateStr: string,
      ): { year: string; month: string; day: string } => {
        const date = new Date(dateStr);
        const year = date.getFullYear().toString().slice(-2); // Get last 2 digits
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const day = date.getDate().toString().padStart(2, "0");
        return { year, month, day };
      };

      const splittedDate = splitDate(dateQuery);

      // Build SQL conditions array
      const sqlConditions: string[] = [];

      // Filter by date (using adjust_date if available, otherwise date)
      if (splittedDate.day && splittedDate.month) {
        const dateValue = `${splittedDate.day}-${splittedDate.month}`;
        sqlConditions.push(`(
          COALESCE(d."adjust_date", d."date") = '${dateValue}'
        )`);
      }

      // Filter by lot number
      if (lotQuery) {
        sqlConditions.push(`d."kd_lot_no" = '${lotQuery}'`);
      }

      // Filter by status
      let statusFilterClause = "";
      if (statusQuery && statusQuery !== "all") {
        // If status is specified (not "all"), filter by that status
        statusFilterClause = `AND (COALESCE(ls."preparation_status", 'open') = '${statusQuery}' OR COALESCE(ls."delivery_status", 'open') = '${statusQuery}')`;
      } else {
        // Default to "in progress" if not specified
        statusFilterClause = `AND (COALESCE(ls."preparation_status", 'open') = 'in progress' OR COALESCE(ls."delivery_status", 'open') = 'in progress')`;
      }

      // Build WHERE clause
      const whereClause =
        sqlConditions.length > 0 ? "AND " + sqlConditions.join(" AND ") : "";

      // Raw SQL query - get scan monitoring data grouped by lot and part number
      const sqlRaw = `
        SELECT
          d."kd_lot_no" as "kd_lot_no",
          d."customer_id" as "customer_id",
          c.name as "customer_name",
          d."delivery_year" as "delivery_year",
          d."part_number" as "part_number",
          d."part_name" as "part_name",
          COUNT(d."part_number") as "total_items",
          SUM(CAST(d."qty" AS INTEGER)) as "total_qty",
          COUNT(d."scan_lt1_at") as "preparation_scanned",
          COUNT(d."scan_lt2_at") as "delivery_scanned",
          MAX(d."scan_lt1_by_name") as "preparation_scan_by",
          MAX(d."scan_lt1_at") as "preparation_scan_at",
          MAX(d."scan_lt2_by_name") as "delivery_scan_by",
          MAX(d."scan_lt2_at") as "delivery_scan_at",
          COALESCE(ls."preparation_status", 'open') as "preparation_status",
          COALESCE(ls."delivery_status", 'open') as "delivery_status",
          prep."full_name" as "scan_lot_by_name",
          del."full_name" as "scan_lot_start_at",
          p."no" as "kasai_part_number",
          p."name" as "kasai_part_name"
        FROM "pokayoke"."deliveries" d
        LEFT JOIN "pokayoke"."customers" c ON d."customer_id" = c."id"
        LEFT JOIN "pokayoke"."scan_lot_status" ls ON d."kd_lot_no" = ls."kd_lot_no"
        LEFT JOIN "pokayoke"."users" as "prep" ON "ls"."preparation_by" = "prep"."id"
        LEFT JOIN "pokayoke"."users" as "del" ON "ls"."delivery_by" = "del"."id"
        LEFT JOIN "pokayoke"."parts" p ON (
          CASE
            WHEN LOWER(d."part_name") LIKE '%sunvisor%'
            THEN REPLACE(d."part_number", '-', '') || d."color_code" = REPLACE(p."no", '-', '')
            ELSE REPLACE(d."part_number", '-', '') = REPLACE(p."no", '-', '')
          END
        ) AND p."customer_id" = c."id"
        WHERE 1=1
          ${whereClause}
          ${statusFilterClause}
        GROUP BY
          d."kd_lot_no",
          d."customer_id",
          c.name,
          d."delivery_year",
          d."part_number",
          d."part_name",
          ls."preparation_status",
          ls."delivery_status",
          prep."full_name",
          del."full_name",
          p."no",
          p."name"
        ORDER BY
          d."kd_lot_no" ASC,
          d."part_number" ASC
      `;

      const result = await db.execute(sqlRaw);

      // Handle different response formats
      const rows = Array.isArray(result) ? result : (result as any).rows || [];

      return c.json({
        result: result,
        summary: {
          date: dateQuery,
          status: statusQuery || "in progress",
          totalLots: new Set(result.map((r: any) => r.kd_lot_no)).size,
          totalItems: result.length,
        },
      });
    } catch (error) {
      console.error("Error fetching lot report:", error);
      return c.json({ error: "Kesalahan internal server" }, 500);
    }
  },
);

deliveriesRoute.get(
  "/hpm/lot-all",
  roleValidationMiddleware([
    "admin",
    "sales",
    "supervisor",
    "production",
    "preparation",
    "delivery",
  ]),
  async (c) => {
    try {
      const dateQuery = c.req.query("date");
      const lotQuery = c.req.query("lot");
      const lotStatus = c.req.query("lot_status");
      const scanTypeQuery = c.req.query("scan_type"); // "delivery" or "preparation"

      let whereLot = "";
      if (lotStatus) {
        whereLot = `
         WHERE COALESCE(lstatus."preparation_status", 'open') = '${lotStatus}' OR COALESCE(lstatus."delivery_status", 'open') = '${lotStatus}'
        `;
      }

      // Validate required parameters
      if (!dateQuery) {
        return c.json({ error: "Tanggal diperlukan" }, 400);
      }

      // Validate date format (YYYY-MM-DD)
      const dateFormatRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateFormatRegex.test(dateQuery)) {
        return c.json(
          {
            error:
              "Format tanggal tidak valid. Gunakan format YYYY-MM-DD (contoh: 2025-05-01)",
          },
          400,
        );
      }

      // Convert input dates (YYYY-MM-DD) to database format (YY-MM-DD)
      const splitDate = (
        dateStr: string,
      ): { year: string; month: string; day: string } => {
        const date = new Date(dateStr);
        const year = date.getFullYear().toString();
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const day = date.getDate().toString().padStart(2, "0");
        return { year, month, day };
      };

      const splittedDate = splitDate(dateQuery);

      // Build SQL conditions array
      const sqlConditions: string[] = [];

      // Filter by year
      if (splittedDate.year) {
        sqlConditions.push(
          `"pokayoke"."deliveries"."delivery_year" = ${parseInt(splittedDate.year)}`,
        );
      }

      // Filter by date
      if (splittedDate.month && splittedDate.day) {
        const dateValue = `${splittedDate.day}-${splittedDate.month}`;
        sqlConditions.push(`(
          "pokayoke"."deliveries"."adjust_date" = '${dateValue}'
          or (
            "pokayoke"."deliveries"."date" = '${dateValue}'
            and "pokayoke"."deliveries"."adjust_date" is null
          )
        )`);
      }

      // Filter by lot number
      if (lotQuery) {
        sqlConditions.push(
          `"pokayoke"."deliveries"."kd_lot_no" = '${lotQuery}'`,
        );
      }

      // Build WHERE clause
      const whereClause =
        sqlConditions.length > 0 ? "and " + sqlConditions.join(" and ") : "";

      // Raw SQL query
      const sqlRaw = `
        select 
        lots.*,
        COALESCE(lstatus."preparation_status", 'open') as "preparationStatus",
        COALESCE(lstatus."delivery_status", 'open') as "deliveryStatus"
        from (
          select
            "pokayoke"."deliveries"."kd_lot_no" as "kdLotNo",
            CAST(SUM(CAST("pokayoke"."deliveries"."qty" AS INTEGER)) AS INTEGER) as "totalQty",
            COUNT("deliveries"."kd_lot_no")::integer as "totalItem"
          from
            "pokayoke"."deliveries"
          where
            1=1
            ${whereClause}
          group by
            "pokayoke"."deliveries"."kd_lot_no"
        ) as "lots"
        left join "pokayoke"."scan_lot_status" as "lstatus"
        on "lots"."kdLotNo" = "lstatus"."kd_lot_no"
        ${whereLot}
        order by "kdLotNo" asc
      `;

      const result = await db.execute(sqlRaw);

      return c.json({
        result,
        summary: {
          date: dateQuery,
          scanType: scanTypeQuery || "all",
          totalLots: result.length,
          totalQty: result.reduce(
            (sum: number, lot: any) => sum + (parseInt(lot.total_qty) || 0),
            0,
          ),
        },
      });
    } catch (error) {
      console.log(error);
      return c.json({ error: "Kesalahan internal server" }, 500);
    }
  },
);

// GET endpoint to check active lot lock status
deliveriesRoute.get(
  "/hpm/lot/lock-status",
  roleValidationMiddleware([
    "admin",
    "preparation",
    "delivery",
    "supervisor",
    "production",
  ]),
  async (c) => {
    try {
      // @ts-ignore
      const userId = c.get("userId") as string;

      // Get user details including fullName
      const userResult = await db
        .select({
          id: users.id,
          fullName: users.fullName,
          username: users.username,
          role: users.role,
        })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (userResult.length == 0) {
        return c.json({ error: "User tidak ditemukan" }, 400);
      }
      const user = userResult[0];
      const role = user.role;
      if (!role || !["preparation", "delivery"].includes(role)) {
        return c.json(
          { error: "Role tidak valid. Gunakan 'preparation' atau 'delivery'" },
          400,
        );
      }

      const statusColumn =
        role === "preparation"
          ? scanLotStatus.preparationStatus
          : scanLotStatus.deliveryStatus;

      const activeLocks = await db
        .select({
          kdLotNo: scanLotStatus.kdLotNo,
          customerId: scanLotStatus.customerId,
          status: statusColumn,
          scanBy:
            role === "preparation"
              ? scanLotStatus.preparationBy
              : scanLotStatus.deliveryBy,
          startedAt:
            role === "preparation"
              ? scanLotStatus.preparationStartedAt
              : scanLotStatus.deliveryStartedAt,
        })
        .from(scanLotStatus)
        .where(eq(statusColumn, "in progress"))
        .limit(1);

      if (activeLocks.length === 0) {
        return c.json({
          message: "Tidak ada lot yang sedang dikunci",
          isLocked: false,
          lockedLot: null,
        });
      }

      // Get user info who holds the lock
      const lockHolder = await db
        .select({
          id: users.id,
          fullName: users.fullName,
          username: users.username,
        })
        .from(users)
        .where(eq(users.id, activeLocks[0].scanBy!))
        .limit(1);

      return c.json({
        message: `Lot ${activeLocks[0].kdLotNo} sedang dikunci`,
        isLocked: true,
        lockedLot: {
          kdLotNo: activeLocks[0].kdLotNo,
          customerId: activeLocks[0].customerId,
          status: activeLocks[0].status,
          startedAt: activeLocks[0].startedAt,
        },
        lockedBy: lockHolder[0]
          ? {
              id: lockHolder[0].id,
              name: lockHolder[0].fullName || lockHolder[0].username,
            }
          : null,
      });
    } catch (error) {
      console.log(error);
      console.error("Lock status error:", error);
      return c.json({ error: "Kesalahan internal server" }, 500);
    }
  },
);

// PATCH endpoint to bypass lot scan - only admin and supervisor
deliveriesRoute.patch(
  "/hpm/lot/bypass",
  roleValidationMiddleware(["admin", "supervisor", "production"]),
  async (c) => {
    try {
      const body = await c.req.json();
      const data = lotBypassSchema.parse(body);
      const role = c.req.query("role") || "preparation"; // default to preparation if not specified

      if (!["preparation", "delivery"].includes(role)) {
        return c.json(
          { error: "Role tidak valid. Gunakan 'preparation' atau 'delivery'" },
          400,
        );
      }

      // Get user info from token
      const userId = c.get("jwtPayload") as any;
      if (!userId) {
        return c.json({ error: "Pengguna tidak terautentikasi" }, 401);
      }

      // Get user details including fullName
      const userResult = await db
        .select({
          id: users.id,
          fullName: users.fullName,
          username: users.username,
        })
        .from(users)
        .where(eq(users.id, userId.id))
        .limit(1);

      const user = userResult[0];
      if (!user) {
        return c.json({ error: "Pengguna tidak ditemukan" }, 404);
      }

      // Update scan_lot_status to mark as bypassed
      const updateData: any = {};

      if (role === "preparation") {
        updateData.preparationBypassedAt = new Date();
        updateData.preparationBypassedBy = userId.id;
        updateData.preparationBypassedReason = data.bypassedReason;
      } else {
        updateData.deliveryBypassedAt = new Date();
        updateData.deliveryBypassedBy = userId.id;
        updateData.deliveryBypassedReason = data.bypassedReason;
      }

      const updatedStatus = await db
        .update(scanLotStatus)
        .set(updateData)
        .where(eq(scanLotStatus.kdLotNo, data.lot))
        .returning();

      if (updatedStatus.length === 0) {
        return c.json(
          { error: "Tidak ada status lot yang ditemukan dengan nomor lot ini" },
          404,
        );
      }

      return c.json({
        message: "Lot berhasil dilewati",
        lot: data.lot,
        role,
        bypassedReason: data.bypassedReason,
        user: {
          id: user.id,
          name: user.fullName || user.username,
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return c.json({ error: error.message }, 400);
      }
      console.log(error);
      return c.json({ error: "Kesalahan internal server" }, 500);
    }
  },
);

// PATCH endpoint to unlock lot - only admin and supervisor
deliveriesRoute.patch(
  "/hpm/lot/unlock",
  roleValidationMiddleware(["admin", "supervisor", "production"]),
  async (c) => {
    try {
      const body = await c.req.json();
      const { lot, role } = body;

      if (!lot) {
        return c.json({ error: "Nomor lot diperlukan" }, 400);
      }

      if (!role || !["preparation", "delivery"].includes(role)) {
        return c.json(
          { error: "Role tidak valid. Gunakan 'preparation' atau 'delivery'" },
          400,
        );
      }

      // Get user info from token
      const userId = c.get("jwtPayload") as any;
      if (!userId) {
        return c.json({ error: "Pengguna tidak terautentikasi" }, 401);
      }

      // Get user details including fullName
      const userResult = await db
        .select({
          id: users.id,
          fullName: users.fullName,
          username: users.username,
        })
        .from(users)
        .where(eq(users.id, userId.id))
        .limit(1);

      const user = userResult[0];
      if (!user) {
        return c.json({ error: "Pengguna tidak ditemukan" }, 404);
      }

      // Unlock the lot by resetting status to pending
      const updateData: any = {};

      if (role === "preparation") {
        updateData.preparationStatus = "pending";
        updateData.preparationBy = null;
        updateData.preparationStartedAt = null;
        updateData.preparationCompletedAt = null;
        updateData.preparationBypassedAt = null;
        updateData.preparationBypassedBy = null;
        updateData.preparationBypassedReason = null;
      } else {
        updateData.deliveryStatus = "pending";
        updateData.deliveryBy = null;
        updateData.deliveryStartedAt = null;
        updateData.deliveryCompletedAt = null;
        updateData.deliveryBypassedAt = null;
        updateData.deliveryBypassedBy = null;
        updateData.deliveryBypassedReason = null;
      }

      const updatedStatus = await db
        .update(scanLotStatus)
        .set(updateData)
        .where(eq(scanLotStatus.kdLotNo, lot))
        .returning();

      if (updatedStatus.length === 0) {
        return c.json(
          { error: "Tidak ada status lot yang ditemukan dengan nomor lot ini" },
          404,
        );
      }

      return c.json({
        message: "Lot berhasil dibuka",
        lot,
        role,
        user: {
          id: user.id,
          name: user.fullName || user.username,
        },
      });
    } catch (error) {
      console.error(error);
      return c.json({ error: "Kesalahan internal server" }, 500);
    }
  },
);

// GET endpoint to retrieve all lot scan statuses for a specific date and customer
deliveriesRoute.get(
  "/scan-lot-status",
  roleValidationMiddleware([
    "admin",
    "sales",
    "supervisor",
    "production",
    "preparation",
    "delivery",
  ]),
  async (c) => {
    try {
      const date = c.req.query("date");
      const customerId = c.req.query("customer_id");

      // Validate required parameters
      if (!date || !customerId) {
        return c.json(
          { error: "Parameter date dan customer_id diperlukan" },
          400,
        );
      }

      // Validate date format (YYYY-MM-DD)
      const dateFormatRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateFormatRegex.test(date)) {
        return c.json(
          {
            error:
              "Format tanggal tidak valid. Gunakan format YYYY-MM-DD (contoh: 2025-05-01)",
          },
          400,
        );
      }

      // Convert input dates (YYYY-MM-DD) to database format (YY-MM-DD)
      const dateObj = new Date(date);
      const year = dateObj.getFullYear().toString();
      const month = String(dateObj.getMonth() + 1).padStart(2, "0");
      const day = String(dateObj.getDate()).padStart(2, "0");

      // Get all unique lots for this customer and date from deliveries table
      const lots = await db
        .select({
          kdLotNo: deliveries.kdLotNo,
        })
        .from(deliveries)
        .where(
          and(
            eq(deliveries.customerId, customerId),
            eq(deliveries.deliveryYear, parseInt(year)),
            eq(deliveries.date, `${day}-${month}`),
          ),
        )
        .groupBy(deliveries.kdLotNo)
        .orderBy(desc(deliveries.kdLotNo));

      // Get scan statuses for all lots
      const lotStatusesWithUser = await Promise.all(
        lots.map(async (lot) => {
          // Get scan status from scan_lot_status table
          const statusResult = await db
            .select()
            .from(scanLotStatus)
            .where(eq(scanLotStatus.kdLotNo, lot.kdLotNo))
            .limit(1);

          const status = statusResult[0];

          // Get total items and scanned/completed counts
          const stats = await db
            .select({
              totalItems: sql<number>`count(*)::int`,
              scannedItems: sql<number>`count(${deliveries.scanLt1At})::int`,
              completedItems: sql<number>`count(${deliveries.scanLt2At})::int`,
            })
            .from(deliveries)
            .where(
              and(
                eq(deliveries.kdLotNo, lot.kdLotNo),
                eq(deliveries.customerId, customerId),
                eq(deliveries.deliveryYear, parseInt(year)),
              ),
            )
            .limit(1);

          const stat = stats[0];

          // Get preparation user info
          let prepUser = null;
          if (status?.preparationBy) {
            const userResult = await db
              .select({
                id: users.id,
                fullName: users.fullName,
                username: users.username,
              })
              .from(users)
              .where(eq(users.id, status.preparationBy))
              .limit(1);
            prepUser = userResult[0];
          }

          // Get delivery user info
          let delUser = null;
          if (status?.deliveryBy) {
            const userResult = await db
              .select({
                id: users.id,
                fullName: users.fullName,
                username: users.username,
              })
              .from(users)
              .where(eq(users.id, status.deliveryBy))
              .limit(1);
            delUser = userResult[0];
          }

          return {
            kdLotNo: lot.kdLotNo,
            preparationStatus: status?.preparationStatus || "pending",
            deliveryStatus: status?.deliveryStatus || "pending",
            isPreparationLocked: status?.preparationStatus === "in progress",
            isDeliveryLocked: status?.deliveryStatus === "in progress",
            preparationBy: status?.preparationBy,
            deliveryBy: status?.deliveryBy,
            preparationByUser: prepUser
              ? {
                  id: prepUser.id,
                  name: prepUser.fullName || prepUser.username,
                }
              : null,
            deliveryByUser: delUser
              ? {
                  id: delUser.id,
                  name: delUser.fullName || delUser.username,
                }
              : null,
            preparationStartedAt: status?.preparationStartedAt,
            preparationCompletedAt: status?.preparationCompletedAt,
            deliveryStartedAt: status?.deliveryStartedAt,
            deliveryCompletedAt: status?.deliveryCompletedAt,
            isPreparationBypassed: !!status?.preparationBypassedAt,
            isDeliveryBypassed: !!status?.deliveryBypassedAt,
            progress: {
              totalItems: stat.totalItems,
              scannedItems: stat.scannedItems,
              completedItems: stat.completedItems,
              preparationCompletionPercentage:
                stat.totalItems > 0
                  ? Math.round(
                      (stat.scannedItems / stat.totalItems) * 100 * 100,
                    ) / 100
                  : 0,
              deliveryCompletionPercentage:
                stat.totalItems > 0
                  ? Math.round(
                      (stat.completedItems / stat.totalItems) * 100 * 100,
                    ) / 100
                  : 0,
            },
          };
        }),
      );

      return c.json({
        date,
        customerId,
        totalLots: lotStatusesWithUser.length,
        lots: lotStatusesWithUser,
      });
    } catch (error) {
      console.error("Error retrieving scan lot status:", error);
      return c.json({ error: "Kesalahan internal server" }, 500);
    }
  },
);

// GET endpoint to check lot completion status
deliveriesRoute.get("/hpm/lot/status", async (c) => {
  try {
    const lot = c.req.query("lot");
    const customerId = c.req.query("customerId");
    const role = c.req.query("role"); // "preparation" or "delivery"

    if (!lot || !customerId || !role) {
      return c.json({ error: "Lot, ID pelanggan, dan role diperlukan" }, 400);
    }

    if (!["preparation", "delivery"].includes(role as string)) {
      return c.json({ error: "Role tidak valid" }, 400);
    }

    // Get all deliveries for this lot and customer
    const deliveryResults = await db
      .select()
      .from(deliveries)
      .where(
        and(
          eq(deliveries.kdLotNo, lot as string),
          eq(deliveries.customerId, customerId as string),
        ),
      );

    const totalItems = deliveryResults.length;

    // Count completed items based on role
    let completedItems = 0;
    let scannedItems = 0;

    if (role === "preparation") {
      scannedItems = deliveryResults.filter((d) => d.scanLt1At).length;
      completedItems = scannedItems; // For preparation, all items need LT1 scan
    } else {
      // For delivery, need both LT1 and LT2
      completedItems = deliveryResults.filter((d) => d.scanLt2At).length;
      scannedItems = deliveryResults.filter(
        (d) => d.scanLt1At || d.scanLt2At,
      ).length;
    }

    const isCompleted = completedItems === totalItems && totalItems > 0;
    const completionPercentage =
      totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

    // Check if lot is locked from scan_lot_status table
    const statusResult = await db
      .select()
      .from(scanLotStatus)
      .where(eq(scanLotStatus.kdLotNo, lot))
      .limit(1);

    const lotStatus = statusResult[0];
    const statusColumn =
      role === "preparation"
        ? lotStatus?.preparationStatus
        : lotStatus?.deliveryStatus;
    const isLocked = statusColumn === "in progress";

    return c.json({
      lot,
      role,
      totalItems,
      scannedItems,
      completedItems,
      completionPercentage: Math.round(completionPercentage * 100) / 100,
      isCompleted,
      isLocked,
      canChangeLot: !isLocked && !isCompleted,
    });
  } catch (error) {
    console.error(error);
    return c.json({ error: "Kesalahan internal server" }, 500);
  }
});

// Get all deliveries - accessible by admin, sales, and supervisor
deliveriesRoute.get(
  "/",
  roleValidationMiddleware([
    "admin",
    "sales",
    "supervisor",
    "production",
    "preparation",
    "delivery",
  ]),
  async (c) => {
    try {
      const page = parseInt(c.req.query("page") || "1");
      const limit = parseInt(c.req.query("perPage") || "10");
      const customerId = c.req.query("customerId");
      const dateFrom = c.req.query("dateFrom");
      const dateTo = c.req.query("dateTo");
      const lot = c.req.query("lot");
      const skip = (page - 1) * limit;

      const whereConditions = [];
      if (dateFrom && dateTo) {
        whereConditions.push(
          sql`TO_DATE(COALESCE("adjust_date", "date") || '-' || "delivery_year", 'DD-MM-YYYY')
          BETWEEN ${dateFrom} AND ${dateTo}`,
        );
      }
      if (customerId) {
        whereConditions.push(eq(deliveries.customerId, customerId));
      }
      if (lot) {
        whereConditions.push(eq(deliveries.kdLotNo, lot));
      }

      // Support multiple column filters
      // Query parameters should be formatted as: filter_columnName=value
      // Example: filter_partNumber=84211&filter_customerName=HPM
      for (const [key, value] of Object.entries(c.req.query())) {
        if (key.startsWith("filter_") && value) {
          const columnFilter = key.replace("filter_", "");
          const pattern = `%${value}%`;
          whereConditions.push(
            sql`${sql.identifier(snakeCase(columnFilter))} ilike ${pattern}`,
          );
        }
      }

      const where =
        whereConditions.length > 0 ? and(...whereConditions) : undefined;

      let sortExpression;
      const userId = c.get("userId") as string;
      const userResult = await db
        .select({
          id: users.id,
          fullName: users.fullName,
          username: users.username,
          role: users.role,
        })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);
      const user = userResult[0];

      if (user.role === 'preparation') {
        // Admin: Ascending, Nulls First
        sortExpression = asc(users.updatedAt).nullsFirst();
      } else if (user.role === 'delivery') {
        // Sales: Ascending, Nulls First
        sortExpression = asc(deliveries.scanLt1At).nullsFirst();
      } else {
        // Manager: Descending, Nulls First
        sortExpression = desc(deliveries.createdAt)
      }

      const [deliveriesData, totalResult] = await Promise.all([
        db
          .select({
            id: deliveries.id,
            customerId: deliveries.customerId,
            orderNo: deliveries.orderNo,
            file: deliveries.file,
            partNumberRaw: deliveries.partNumberRaw,
            partNumber: deliveries.partNumber,
            partName: deliveries.partName,
            colorCode: deliveries.colorCode,
            seqProd: deliveries.seqProd,
            kdLotNo: deliveries.kdLotNo,
            qty: deliveries.qty,
            date: deliveries.date,
            time: deliveries.time,
            adjustDate: deliveries.adjustDate,
            adjustTime: deliveries.adjustTime,
            slipNumber: deliveries.slipNumber,
            remarksBawah: deliveries.remarksBawah,
            barcodeHpm: deliveries.barcodeHpm,
            barcodeKasaiRaw: deliveries.barcodeKasaiRaw,
            barcodeKasai: deliveries.barcodeKasai,
            scanLt1By: deliveries.scanLt1By,
            scanLt1ByName: deliveries.scanLt1ByName,
            scanLt1At: deliveries.scanLt1At,
            scanLt2By: deliveries.scanLt2By,
            scanLt2ByName: deliveries.scanLt2ByName,
            scanLt2At: deliveries.scanLt2At,
            createdAt: deliveries.createdAt,
            updatedAt: deliveries.updatedAt,
            deliveryYear: deliveries.deliveryYear,
            scanLt1Qr: deliveries.scanLt1Qr,
            scanLt2Qr: deliveries.scanLt2Qr,
            customer: {
              id: customers.id,
              name: customers.name,
              alias: customers.alias,
            },
          })
          .from(deliveries)
          .leftJoin(customers, eq(deliveries.customerId, customers.id))
          .where(where)
          .limit(limit)
          .offset(skip)
          .orderBy(sortExpression),
        db.select({ count: count() }).from(deliveries).where(where),
      ]);

      const total = totalResult[0]?.count || 0;

      return c.json({
        result: deliveriesData,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.log(error);
      return c.json({ error: "Kesalahan internal server" }, 500);
    }
  },
);

// Export raw deliveries to Excel - accessible by admin, sales, and supervisor
deliveriesRoute.get(
  "/export-raw",
  roleValidationMiddleware(["admin", "sales", "supervisor", "production"]),
  async (c) => {
    try {
      const dateFrom = c.req.query("dateFrom");
      const dateTo = c.req.query("dateTo");
      const customerId = c.req.query("customerId");

      // Validate required parameters
      if (!dateFrom || !dateTo || !customerId) {
        return c.json(
          {
            error:
              "Parameter dateFrom, dateTo, dan customerId diperlukan",
          },
          400,
        );
      }

      // Validate date format (YYYY-MM-DD)
      const dateFormatRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (
        !dateFormatRegex.test(dateFrom) ||
        !dateFormatRegex.test(dateTo)
      ) {
        return c.json(
          {
            error:
              "Format tanggal tidak valid. Gunakan format YYYY-MM-DD (contoh: 2025-05-01)",
          },
          400,
        );
      }

      // Check if customer exists
      const customerResult = await db
        .select()
        .from(customers)
        .where(eq(customers.id, customerId))
        .limit(1);

      const customer = customerResult?.[0];
      if (!customer) {
        return c.json({ error: "Pelanggan tidak ditemukan" }, 404);
      }

      // Build WHERE conditions using SQL that handles both date and adjust_date
      const whereConditions = [
        sql`TO_DATE(COALESCE("deliveries"."adjust_date", "deliveries"."date") || '-' || "deliveries"."delivery_year", 'DD-MM-YYYY')
        BETWEEN ${dateFrom} AND ${dateTo}`,
        eq(deliveries.customerId, customerId),
      ];

      const where = and(...whereConditions);

      // Fetch deliveries data
      const deliveriesResult = await db
        .select({
          customerName: customers.name,
          kdLotNo: deliveries.kdLotNo,
          partNumber: deliveries.partNumber,
          partName: deliveries.partName,
          colorCode: deliveries.colorCode,
          qty: deliveries.qty,
          date: deliveries.date,
          time: deliveries.time,
          adjustDate: deliveries.adjustDate,
          adjustTime: deliveries.adjustTime,
          remarksBawah: deliveries.remarksBawah,
          barcodeHpm: deliveries.barcodeHpm,
          barcodeKasai: deliveries.barcodeKasai,
          scanLt1At: deliveries.scanLt1At,
          scanLt1ByName: deliveries.scanLt1ByName,
          scanLt2At: deliveries.scanLt2At,
          scanLt2ByName: deliveries.scanLt2ByName,
        })
        .from(deliveries)
        .leftJoin(customers, eq(deliveries.customerId, customers.id))
        .where(where)
        .orderBy(deliveries.kdLotNo, deliveries.partNumber);

      if (deliveriesResult.length === 0) {
        return c.json({ error: "Tidak ada data ditemukan" }, 404);
      }

      // Create new workbook
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Deliveries Raw Data");

      // Define columns
      worksheet.columns = [
        { header: "Customer", key: "customerName", width: 30 },
        { header: "Lot No", key: "kdLotNo", width: 20 },
        { header: "Part Number", key: "partNumber", width: 20 },
        { header: "Part Name", key: "partName", width: 40 },
        { header: "Color Code", key: "colorCode", width: 15 },
        { header: "Qty", key: "qty", width: 10 },
        { header: "Date", key: "date", width: 15 },
        { header: "Time", key: "time", width: 15 },
        { header: "Adjust Date", key: "adjustDate", width: 15 },
        { header: "Adjust Time", key: "adjustTime", width: 15 },
        { header: "Remarks", key: "remarksBawah", width: 30 },
        { header: "Barcode HPM", key: "barcodeHpm", width: 30 },
        { header: "Barcode Kasai", key: "barcodeKasai", width: 30 },
        { header: "Scan LT1 At", key: "scanLt1At", width: 25 },
        { header: "Scan LT1 By", key: "scanLt1ByName", width: 25 },
        { header: "Scan LT2 At", key: "scanLt2At", width: 25 },
        { header: "Scan LT2 By", key: "scanLt2ByName", width: 25 },
      ];

      // Style header row
      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true };
      headerRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFE0E0E0" },
      };

      // Add data rows
      let rowIndex = 2; // Start from row 2 (row 1 is header)
      deliveriesResult.forEach((delivery: any) => {
        const row = worksheet.addRow({
          customerName: delivery.customerName || "",
          kdLotNo: delivery.kdLotNo || "",
          partNumber: delivery.partNumber || "",
          partName: delivery.partName || "",
          colorCode: delivery.colorCode || "",
          qty: delivery.qty || 0,
          date: delivery.date || "",
          time: delivery.time || "",
          adjustDate: delivery.adjustDate || "",
          adjustTime: delivery.adjustTime || "",
          remarksBawah: delivery.remarksBawah || "",
          barcodeHpm: delivery.barcodeHpm || "",
          barcodeKasai: delivery.barcodeKasai || "",
          scanLt1At: delivery.scanLt1At
            ? new Date(delivery.scanLt1At).toLocaleString("id-ID")
            : "",
          scanLt1ByName: delivery.scanLt1ByName || "",
          scanLt2At: delivery.scanLt2At
            ? new Date(delivery.scanLt2At).toLocaleString("id-ID")
            : "",
          scanLt2ByName: delivery.scanLt2ByName || "",
        });

        // Highlight Adjust Date and Adjust Time columns if they have values
        // Adjust Date is column 9 (I), Adjust Time is column 10 (J)
        if (delivery.adjustDate && delivery.adjustDate !== "") {
          row.getCell(9).fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF00FF00" }, // Green background
          };
          row.getCell(9).font = {
            color: { argb: "FF000000" }, // Black text
            bold: true,
          };
        }

        if (delivery.adjustTime && delivery.adjustTime !== "") {
          row.getCell(10).fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF00FF00" }, // Green background
          };
          row.getCell(10).font = {
            color: { argb: "FF000000" }, // Black text
            bold: true,
          };
        }

        rowIndex++;
      });

      // Generate buffer
      const buffer = await workbook.xlsx.writeBuffer();
      const bufferLength = buffer.byteLength;

      // Set response headers for file download
      c.header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      c.header(
        "Content-Disposition",
        `attachment; filename="Deliveries_Raw_${customer.alias}_${dateFrom}_to_${dateTo}.xlsx"`,
      );
      c.header("Content-Length", bufferLength.toString());

      return c.body(buffer);
    } catch (error) {
      console.error("Export raw error:", error);
      return c.json(
        {
          error: "Kesalahan internal server",
          details:
            error instanceof Error
              ? error.message
              : "Kesalahan tidak diketahui",
        },
        500,
      );
    }
  },
);

// Get delivery by ID - accessible by admin, sales, and supervisor
deliveriesRoute.get(
  "/:id",
  roleValidationMiddleware([
    "admin",
    "sales",
    "supervisor",
    "production",
    "preparation",
    "delivery",
  ]),
  async (c) => {
    try {
      const id = c.req.param("id");

      const deliveryResult = await db
        .select({
          id: deliveries.id,
          customerId: deliveries.customerId,
          orderNo: deliveries.orderNo,
          file: deliveries.file,
          partNumberRaw: deliveries.partNumberRaw,
          partNumber: deliveries.partNumber,
          partName: deliveries.partName,
          colorCode: deliveries.colorCode,
          seqProd: deliveries.seqProd,
          kdLotNo: deliveries.kdLotNo,
          qty: deliveries.qty,
          date: deliveries.date,
          time: deliveries.time,
          adjustDate: deliveries.adjustDate,
          adjustTime: deliveries.adjustTime,
          slipNumber: deliveries.slipNumber,
          remarksBawah: deliveries.remarksBawah,
          barcodeHpm: deliveries.barcodeHpm,
          barcodeKasaiRaw: deliveries.barcodeKasaiRaw,
          barcodeKasai: deliveries.barcodeKasai,
          scanLt1By: deliveries.scanLt1By,
          scanLt1ByName: deliveries.scanLt1ByName,
          scanLt1At: deliveries.scanLt1At,
          scanLt2By: deliveries.scanLt2By,
          scanLt2ByName: deliveries.scanLt2ByName,
          scanLt2At: deliveries.scanLt2At,
          createdAt: deliveries.createdAt,
          updatedAt: deliveries.updatedAt,
          customer: {
            id: customers.id,
            name: customers.name,
            alias: customers.alias,
            address: customers.address,
            createdAt: customers.createdAt,
            updatedAt: customers.updatedAt,
          },
        })
        .from(deliveries)
        .leftJoin(customers, eq(deliveries.customerId, customers.id))
        .where(eq(deliveries.id, id))
        .limit(1);

      const delivery = deliveryResult[0];

      if (!delivery) {
        return c.json({ error: "Pengiriman tidak ditemukan" }, 404);
      }

      return c.json({ delivery });
    } catch (error) {
      return c.json({ error: "Kesalahan internal server" }, 500);
    }
  },
);

deliveriesRoute.patch("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const data = deliverySchema.parse(body);

    // Check if customer exists
    const customerResult = await db
      .select()
      .from(customers)
      .where(eq(customers.id, data.customerId))
      .limit(1);
    const customer = customerResult[0];

    if (!customer) {
      return c.json({ error: "Pelanggan tidak ditemukan" }, 404);
    }

    // Convert date strings to Date objects if provided
    const updateData: any = { ...data };
    if (data.scanLt1At) {
      updateData.scanLt1At = new Date(data.scanLt1At);
    }
    if (data.scanLt2At) {
      updateData.scanLt2At = new Date(data.scanLt2At);
    }

    const [delivery] = await db
      .update(deliveries)
      .set(updateData)
      .where(eq(deliveries.id, id))
      .returning();

    return c.json({
      message: "Pengiriman berhasil diperbarui",
      delivery,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: error.message }, 400);
    }
    return c.json({ error: "Kesalahan internal server" }, 500);
  }
});

// Delete delivery - only accessible by admin role
deliveriesRoute.delete(
  "/:id",
  roleValidationMiddleware(["admin"]),
  async (c) => {
    try {
      const id = c.req.param("id");

      await db.delete(deliveries).where(eq(deliveries.id, id));

      return c.json({ message: "Pengiriman berhasil dihapus" });
    } catch (error) {
      return c.json({ error: "Kesalahan internal server" }, 500);
    }
  },
);

// Import deliveries from CSV/Excel - accessible by admin and sales roles
deliveriesRoute.post(
  "/import",
  roleValidationMiddleware(["admin", "sales", "supervisor", "production"]),
  async (c) => {
    try {
      const formData = await c.req.formData();
      const file = formData.get("file") as File;
      const customerId = formData.get("customerId");
      const deliveryYear = formData.get("deliveryYear") as string | null;

      if (!file) {
        return c.json({ message: "File diperlukan" }, 400);
      }

      if (!customerId) {
        return c.json({ message: "Pelanggan diperlukan" }, 400);
      }

      if (!deliveryYear) {
        return c.json({ message: "Tahun pengiriman diperlukan" }, 400);
      }

      const customerResult = await db
        .select()
        .from(customers)
        .where(eq(customers.id, customerId as string))
        .limit(1);
      const customer = customerResult[0];

      if (!customer) {
        return c.json({ message: "Pelanggan tidak valid" }, 400);
      }

      const fileName = file.name.toLowerCase();
      let csvContent: string[] = [];

      // Check file type and parse accordingly
      if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
        // Parse Excel file
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convert to CSV-like array
        const data = XLSX.utils.sheet_to_csv(worksheet);
        csvContent = data.split("\r\n");
      } else if (fileName.endsWith(".csv") || fileName.endsWith(".txt")) {
        // Parse CSV/TXT file
        const raw = await file.text();
        csvContent = raw.split("\r\n");
      } else {
        return c.json(
          {
            message:
              "Format file tidak didukung. Silakan unggah file CSV, TXT, atau Excel.",
          },
          400,
        );
      }

      // Validate and parse delivery data
      // Reject file if any record has: null/empty lot, lot not starting with HPM, qty < 1, or null/empty date
      const deliveryData: any[] = [];
      const headers = { orderNo: "", file: "" };
      const validationErrors: string[] = [];
      let lineNumber = 0;

      for (let i = 0; i < csvContent.length; i++) {
        const lineItem = csvContent[i];
        lineNumber = i + 1; // Line numbers are 1-indexed for error messages

        if (i == 0) {
          const [, orderNo, file] = lineItem
            .split(" ")
            .filter((h) => h.trim() !== "");
          headers.orderNo = orderNo;
          headers.file = file;
          continue;
        }
        if (lineItem.toUpperCase().startsWith("DI")) {
          const partNumberRaw = lineItem.substring(134, 134 + 18).trim();
          const partNumber = partNumberRaw
            .split(" -")
            .map((i) => i.replace("-", ""))
            .join("-");
          const partName = lineItem.substring(180, 180 + 30).trim();
          const colorCode = lineItem.substring(210, 210 + 6).trim();
          const seqProd = lineItem.substring(245, 245 + 12).trim();
          const kdLotNo = lineItem.substring(257, 257 + 18).trim();
          const qty = Number(lineItem.substring(279, 279 + 2).trim());
          const date = lineItem.substring(281, 281 + 5).trim();
          const time = lineItem.substring(289, 289 + 5).trim();
          const slipNumber = lineItem.substring(2, 2 + 12).trim();
          const remarksBawah =
            lineItem
              .substring(2, 2 + 19)
              .trim()
              .replace(/\ /g, "") + lineItem.substring(275, 275 + 6).trim();
          // const barcodeHpm =
          //   remarksBawah.length < 20 ? "" : "";
          const barcodeHpm = "";
          const barcodeKasaiRaw =
            partNumberRaw.length < 10 ? "" : partNumberRaw + " " + colorCode;
          const barcodeKasai = "";

          // Validation: Check all required conditions
          // 1. Lot number must not be null or empty
          if (!kdLotNo || kdLotNo.trim() === "") {
            validationErrors.push(
              `Baris ${lineNumber}: Nomor lot kosong`
            );
            continue;
          }

          // 2. Lot number must start with "HPM" (case-insensitive)
          if (!kdLotNo.toUpperCase().startsWith("HPM")) {
            validationErrors.push(
              `Baris ${lineNumber}: Nomor lot "${kdLotNo}" tidak diawali dengan "HPM"`
            );
            continue;
          }

          // 3. Quantity must be at least 1
          if (!qty || qty < 1) {
            validationErrors.push(
              `Baris ${lineNumber}: Quantity tidak valid (${qty}), harus minimal 1`
            );
            continue;
          }

          // 4. Date must not be null or empty
          if (!date || date.trim() === "") {
            validationErrors.push(
              `Baris ${lineNumber}: Tanggal kosong`
            );
            continue;
          }

          // All validations passed, add to deliveryData
          deliveryData.push({
            ...headers,
            customerId: customer.id,
            partNumberRaw,
            partNumber,
            partName,
            colorCode,
            seqProd,
            kdLotNo,
            qty,
            date,
            time,
            slipNumber,
            remarksBawah,
            barcodeHpm,
            barcodeKasaiRaw,
            barcodeKasai,
            deliveryYear,
          });
        }
      }

      // If there are validation errors, reject the entire file
      if (validationErrors.length > 0) {
        return c.json(
          {
            error: "Validasi file gagal",
            message: "File tidak valid. Mohon periksa data Anda dan coba lagi.",
            validationErrors,
            totalErrors: validationErrors.length,
            hint: "Pastikan: (1) Nomor lot terisi dan diawali dengan 'HPM', (2) Quantity minimal 1, (3) Tanggal terisi"
          },
          400,
        );
      }

      // Check if there's any valid data to import
      if (deliveryData.length === 0) {
        return c.json(
          {
            error: "Tidak ada data valid",
            message: "File tidak mengandung data yang valid untuk diimpor. Pastikan file memiliki format yang benar."
          },
          400,
        );
      }

      // Process each delivery with upsert logic
      let insertedCount = 0;
      let updatedCount = 0;
      let skippedCount = 0;
      const importedLotNos = new Set<string>();

      for (const delivery of deliveryData) {
        // Check if delivery already exists by kdLotNo, partNumber, and barcodeHpm
        const existingDelivery = await db
          .select()
          .from(deliveries)
          .where(
            and(
              eq(deliveries.kdLotNo, delivery.kdLotNo),
              eq(deliveries.partNumber, delivery.partNumber),
              eq(deliveries.remarksBawah, delivery.remarksBawah),
              eq(deliveries.qty, delivery.qty),
              eq(deliveries.colorCode, delivery.colorCode),
            ),
          )
          .limit(1);

        if (existingDelivery.length > 0) {
          // Delivery exists, check if it has adjust_date
          if (existingDelivery[0].adjustDate) {
            // Has adjust_date, skip this record
            skippedCount++;
            importedLotNos.add(delivery.kdLotNo);
            continue;
          } else {
            // No adjust_date, update by id
            await db
              .update(deliveries)
              .set({
                ...delivery,
                updatedAt: new Date(),
              })
              .where(eq(deliveries.id, existingDelivery[0].id));
            updatedCount++;
            importedLotNos.add(delivery.kdLotNo);
          }
        } else {
          // Delivery doesn't exist, insert new
          await db.insert(deliveries).values(delivery);
          insertedCount++;
          importedLotNos.add(delivery.kdLotNo);
        }
      }

      // After all deliveries are imported, create scan_lot_status entries
      // Only insert if the lot doesn't already exist in scan_lot_status
      let scanLotStatusCreated = 0;
      let scanLotStatusSkipped = 0;

      const uniqueLotNos = Array.from(importedLotNos);
      for (const kdLotNo of uniqueLotNos) {
        // Check if scan_lot_status already exists for this lot
        const existingStatus = await db
          .select()
          .from(scanLotStatus)
          .where(eq(scanLotStatus.kdLotNo, kdLotNo))
          .limit(1);

        if (existingStatus.length === 0) {
          // Insert new scan_lot_status with open status
          // Only insert if the lot doesn't exist to avoid overwriting existing status
          await db.insert(scanLotStatus).values({
            kdLotNo,
            customerId: customerId as string,
            preparationStatus: "open",
            deliveryStatus: "open",
          });
          scanLotStatusCreated++;
        } else {
          // Skip if lot already exists (to preserve existing scan status)
          scanLotStatusSkipped++;
        }
      }

      return c.json({
        message: "Impor berhasil",
        summary: {
          inserted: insertedCount,
          updated: updatedCount,
          skipped: skippedCount,
          total: insertedCount + updatedCount + skippedCount,
          scanLotStatus: {
            created: scanLotStatusCreated,
            skipped: scanLotStatusSkipped,
            totalLots: importedLotNos.size,
          },
        },
      });
    } catch (error) {
      console.error("Import error:", error);
      return c.json(
        {
          error: "Kesalahan internal server",
          details:
            error instanceof Error
              ? error.message
              : "Kesalahan tidak diketahui",
        },
        500,
      );
    }
  },
);

// Bulk update deliveries - accessible by admin and sales roles
deliveriesRoute.put(
  "/bulk-update",
  roleValidationMiddleware(["admin", "sales"]),
  async (c) => {
    try {
      const body = await c.req.json();
      const { deliveries: deliveriesData } = body;

      if (!Array.isArray(deliveriesData) || deliveriesData.length === 0) {
        return c.json({ message: "Array pengiriman diperlukan" }, 400);
      }

      let updatedCount = 0;
      let notFoundCount = 0;
      const errors: any[] = [];

      for (const deliveryData of deliveriesData) {
        try {
          const { id, ...updateFields } = deliveryData;

          if (!id) {
            errors.push({ delivery: deliveryData, error: "ID diperlukan" });
            continue;
          }

          // Check if delivery exists
          const existingDelivery = await db
            .select({ id: deliveries.id })
            .from(deliveries)
            .where(eq(deliveries.id, id))
            .limit(1);

          if (existingDelivery.length === 0) {
            notFoundCount++;
            continue;
          }

          // Update delivery
          await db
            .update(deliveries)
            .set({
              ...updateFields,
              updatedAt: new Date(),
            })
            .where(eq(deliveries.id, id));

          updatedCount++;
        } catch (error) {
          errors.push({
            delivery: deliveryData,
            error:
              error instanceof Error
                ? error.message
                : "Kesalahan tidak diketahui",
          });
        }
      }

      return c.json({
        message: "Pembaruan massal selesai",
        summary: {
          updated: updatedCount,
          notFound: notFoundCount,
          errors: errors.length,
        },
        errors: errors.length > 0 ? errors : undefined,
      });
    } catch (error) {
      console.error("Bulk update error:", error);
      return c.json(
        {
          error: "Kesalahan internal server",
          details:
            error instanceof Error
              ? error.message
              : "Kesalahan tidak diketahui",
        },
        500,
      );
    }
  },
);

// Update delivery by slip number - accessible by admin and sales roles
deliveriesRoute.put(
  "/slip/:slipNumber",
  roleValidationMiddleware(["admin", "sales"]),
  async (c) => {
    try {
      const slipNumber = c.req.param("slipNumber");
      const body = await c.req.json();

      // Check if delivery exists
      const existingDelivery = await db
        .select()
        .from(deliveries)
        .where(eq(deliveries.slipNumber, slipNumber))
        .limit(1);

      if (existingDelivery.length === 0) {
        return c.json({ error: "Pengiriman tidak ditemukan" }, 404);
      }

      // Update delivery
      const [delivery] = await db
        .update(deliveries)
        .set({
          ...body,
          updatedAt: new Date(),
        })
        .where(eq(deliveries.slipNumber, slipNumber))
        .returning();

      return c.json({
        message: "Pengiriman berhasil diperbarui",
        delivery,
      });
    } catch (error) {
      console.error("Update error:", error);
      return c.json(
        {
          error: "Kesalahan internal server",
          details:
            error instanceof Error
              ? error.message
              : "Kesalahan tidak diketahui",
        },
        500,
      );
    }
  },
);

// Export deliveries to Excel template - accessible by admin, sales, and supervisor
deliveriesRoute.post(
  "/export",
  roleValidationMiddleware(["admin", "sales", "supervisor", "production"]),
  async (c) => {
    try {
      const body = await c.req.json();
      const { lots, format } = body;

      if (!lots || !Array.isArray(lots) || lots.length === 0) {
        return c.json({ error: "Array lots diperlukan" }, 400);
      }

      // Fetch all deliveries based on lot and partNumber from payload
      const allDeliveries: any[] = [];

      for (const item of lots) {
        const { lot, partNumber } = item;

        if (!lot || !partNumber) {
          continue;
        }

        // Find deliveries matching lot and partNumber
        const deliveriesResult = await db
          .select()
          .from(deliveries)
          .where(
            and(
              eq(deliveries.kdLotNo, lot),
              eq(deliveries.partNumber, partNumber),
            ),
          );

        allDeliveries.push(...deliveriesResult);
      }

      if (allDeliveries.length === 0) {
        return c.json({ error: "Tidak ada data pengiriman ditemukan" }, 404);
      }

      // For each delivery, check if it exists in parts table
      const validatedDeliveries: any[] = [];

      for (const delivery of allDeliveries) {
        const partNameLower = delivery.partName.toLowerCase();
        let partFound = false;

        // Remove '-' from partNumber for parts lookup
        const cleanedPartNumber = delivery.partNumber.replace(/-/g, "");

        if (partNameLower.includes("sunvisor")) {
          // For sunvisor: combine partNumber + color_code (without separator)
          const combinedPartNo = cleanedPartNumber + (delivery.colorCode || "");
          const cleanedCombinedPartNo = combinedPartNo.replace(/-/g, "");

          // Search in parts table by 'no' column (with '- removed)
          const partResult = await db
            .select()
            .from(parts)
            .where(
              sql`REPLACE(${parts.no}, '-', '') = ${cleanedCombinedPartNo}`,
            )
            .limit(1);

          if (partResult.length > 0) {
            partFound = true;
          }
        } else {
          // For non-sunvisor: search by partNumber (with '- removed')
          const partResult = await db
            .select()
            .from(parts)
            .where(sql`REPLACE(${parts.no}, '-', '') = ${cleanedPartNumber}`)
            .limit(1);

          if (partResult.length > 0) {
            partFound = true;
          }
        }

        // Only add if part is found in parts table
        if (partFound) {
          validatedDeliveries.push(delivery);
        }
      }

      if (validatedDeliveries.length === 0) {
        return c.json(
          { error: "Tidak ada data yang valid ditemukan di table parts" },
          404,
        );
      }

      const deliveriesData = validatedDeliveries;

      // Load Excel template using ExcelJS (better for macros support)
      let templatePath =
        process.cwd() + "/PRONES_Unscheduled_Shipment_FORM_2.xlsx";
      if (format === "xlsm") {
        templatePath =
          process.cwd() + "/PRONES_Unscheduled_Shipment_FORM_2.xlsm";
      }
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(templatePath);
      const worksheet = workbook.getWorksheet("Ship result");

      if (!worksheet) {
        return c.json(
          { error: "Worksheet 'Ship result' tidak ditemukan dalam template" },
          404,
        );
      }

      // Helper function to convert DD-MM or DD-MM-YY to YYYYMMDD
      const convertDateToYYYYMMDD = (dateStr: string, year: number): string => {
        // Parse DD-MM or DD-MM-YY format
        const parts = dateStr.split("-");
        if (parts.length >= 2) {
          const day = parts[0].padStart(2, "0");
          const month = parts[1].padStart(2, "0");
          const yearStr = year.toString();
          return `${yearStr}${month}${day}`;
        }
        return "";
      };

      // Clear existing data from row 9 onwards (A1:P16 range)
      // Start from row 9 (index 8) and clear data
      const lastRow = worksheet.rowCount;
      for (let row = 9; row <= lastRow; row++) {
        const rowObj = worksheet.getRow(row);
        rowObj.eachCell({ includeEmpty: true }, (cell) => {
          const colNum =
            typeof cell.col === "number"
              ? cell.col
              : parseInt(cell.col as string);
          if (colNum >= 1 && colNum <= 16) {
            // Columns A(1) to P(16)
            cell.value = null;
          }
        });
      }

      // Write data starting from row 9 (1-indexed in ExcelJS)
      let currentRow = 9;

      // Group deliveries by lot number
      const groupedByLot = deliveriesData.reduce(
        (acc, delivery) => {
          const lot = delivery.kdLotNo;
          if (!acc[lot]) {
            acc[lot] = [];
          }
          acc[lot].push(delivery);
          return acc;
        },
        {} as Record<string, typeof deliveriesData>,
      );

      // Write each delivery
      for (const [, lotDeliveries] of Object.entries(groupedByLot)) {
        for (const delivery of lotDeliveries as any[]) {
          // Use adjustDate if available, otherwise use date
          const dateToUse = delivery.adjustDate || delivery.date;
          const shipDate = convertDateToYYYYMMDD(
            dateToUse,
            delivery.deliveryYear || new Date().getFullYear(),
          );

          // Get the row and set values
          const row = worksheet.getRow(currentRow);

          // A (1): Factory - Fixed "6110"
          row.getCell(1).value = "6110";

          // B (2): Slip Cls - Fixed "00"
          row.getCell(2).value = "00";

          // C (3): Customer - Fixed "B110030"
          row.getCell(3).value = "B110030";

          // D (4): Ship to - Fixed "B110031"
          row.getCell(4).value = "B110031";

          // E (5): Delivery Location - Empty
          // F (6): Ship Location - Empty

          // G (7): Ship date - YYYYMMDD format
          row.getCell(7).value = shipDate;

          // H (8): Item code - part_number
          row.getCell(8).value = delivery.partNumber;

          // I (9): PO No. - po_number
          row.getCell(9).value = delivery.poNumber || "00000000";

          // J (10): Qty
          row.getCell(10).value = parseInt(delivery.qty) || 0;

          // K (11): SNP - Empty
          // L (12): Delivery note No. - Empty
          // M (13): Unit Price - Empty

          // N (14): Price cls - Fixed "00"
          row.getCell(14).value = "00";

          // O (15): Remark1 - Empty
          // P (16): Remark2 - Empty

          currentRow++;
        }
      }

      // Generate buffer as xlsm format
      const buffer = await workbook.xlsx.writeBuffer();
      const bufferLength = buffer.byteLength;

      // Set response headers for file download
      c.header(
        "Content-Type",
        "application/vnd.ms-excel.sheet.macroEnabled.12",
      );
      c.header(
        "Content-Disposition",
        `attachment; filename="PRONES_Shipment_Export_${new Date().toISOString().split("T")[0]}.xlsm"`,
      );
      c.header("Content-Length", bufferLength.toString());

      return c.body(buffer);
    } catch (error) {
      console.error("Export error:", error);
      return c.json(
        {
          error: "Kesalahan internal server",
          details:
            error instanceof Error
              ? error.message
              : "Kesalahan tidak diketahui",
        },
        500,
      );
    }
  },
);

// Import delivery revisions from Excel - accessible by admin and sales roles
deliveriesRoute.post(
  "/revision",
  roleValidationMiddleware(["admin", "sales", "supervisor", "production"]),
  async (c) => {
    try {
      const formData = await c.req.formData();
      const file = formData.get("file") as File;
      const customerId = formData.get("customerId") as string;
      const preview = formData.get("preview") === "1";

      if (!file) {
        return c.json({ error: "File diperlukan" }, 400);
      }

      if (!customerId) {
        return c.json({ error: "ID pelanggan diperlukan" }, 400);
      }

      // Find customer by alias
      const customerResult = await db
        .select()
        .from(customers)
        .where(eq(customers.id, customerId))
        .limit(1);

      const customer = customerResult?.[0];
      if (!customer) {
        return c.json({ error: "Pelanggan tidak ditemukan" }, 404);
      }

      // Read Excel file
      const buffer = await file.arrayBuffer();
      const fileBuffer = Buffer.from(buffer);
      const workbook = XLSX.read(buffer, { type: "buffer" });

      // Find sheets starting with "LINE"
      const lineSheets = workbook.SheetNames.filter((name) =>
        name.toUpperCase().startsWith("LINE"),
      );

      if (lineSheets.length === 0) {
        return c.json(
          {
            error: "Tidak ada sheet LINE yang ditemukan dalam file Excel",
          },
          400,
        );
      }

      // Helper function to convert Excel date (serial or string) to DD-MM-YY format
      const excelDateToDMY = (
        excelDate: number | string,
        getDayMonth: boolean,
      ): string => {
        // If already a string in DD-MMM-YY format (e.g., "03-Feb-26")
        if (typeof excelDate === "string") {
          const parts = excelDate.split("-");
          if (parts.length === 3) {
            const day = parts[0].padStart(2, "0");
            // Map month abbreviation to number
            const monthMap: Record<string, string> = {
              Jan: "01",
              Feb: "02",
              Mar: "03",
              Apr: "04",
              May: "05",
              Jun: "06",
              Jul: "07",
              Aug: "08",
              Sep: "09",
              Oct: "10",
              Nov: "11",
              Dec: "12",
            };
            const month = monthMap[parts[1]] || "01";
            const year = parts[2]; // Last 2 digits

            if (getDayMonth) {
              return `${day}-${month}`;
            }

            return `${day}-${month}-${year}`;
          }
        }

        // Excel epoch starts at January 1, 1900 (but Excel incorrectly treats 1900 as a leap year)
        const excelEpoch = new Date(1900, 0, 1);
        const daysOffset = Number(excelDate) - 1; // Adjust for Excel's leap year bug
        const date = new Date(
          excelEpoch.getTime() + daysOffset * 24 * 60 * 60 * 1000,
        );

        // Use UTC methods to avoid timezone issues (server is UTC+7/WIB)
        const day = String(date.getUTCDate()).padStart(2, "0");
        const month = String(date.getUTCMonth() + 1).padStart(2, "0");
        const year = String(date.getUTCFullYear()).slice(-2); // Last 2 digits

        if (getDayMonth) {
          return `${day}-${month}`;
        }

        return `${day}-${month}-${year}`;
      };

      // Helper function to convert Excel decimal time to HH:MM format
      const excelTimeToHM = (excelTime: number): string => {
        const totalSeconds = Math.round(excelTime * 24 * 60 * 60);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);

        return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
      };

      let updatedCount = 0;
      let case1UpdatedCount = 0;
      let case2UpdatedCount = 0;
      let notFoundCount = 0;
      const errors: any[] = [];
      const revisionDetails: any[] = [];
      const previewData: any[] = [];

      // Track lots and deliveries for Case 2 processing
      const adjustedLots = new Set<string>(); // Lots that have adjustments
      const adjustedDeliveryIds = new Set<string>(); // Delivery IDs that were adjusted in Case 1
      const lotPoMap = new Map<string, string>(); // Map lot number to PO number

      // Process all LINE sheets
      for (const sheetName of lineSheets) {
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
        }) as any[][];

        // Start reading from row 6 (0-indexed)
        for (let i = 6; i < data.length; i++) {
          const row = data[i];

          // Skip weekly markers (e.g., "Weekly 03 2026")
          if (
            row[0] &&
            typeof row[0] === "string" &&
            row[0].toLowerCase().includes("weekly")
          ) {
            continue;
          }

          // Skip empty rows or rows without part number
          if (!row[5] || (typeof row[5] === "string" && row[5].trim() === "")) {
            continue;
          }

          // Extract columns
          const partNumber = String(row[5]).trim().replace(/\ /g, "-");
          const adjustDateRaw = row[10]; // Adjustment Delivery Schedule Ship Date
          const adjustTimeRaw = row[12]; // Adjustment Delivery Schedule Ship Time
          const adjustQtyRaw = row[14]; // Adjustment Delivery Schedule Quantity
          const kdLotNo = row[16] ? String(row[16]).trim() : "";

          // Extract PO Number from kdLotNo (remove 'HPM ' prefix)
          const poNumber = kdLotNo.replace(/^HPM\s*/i, "");

          // Store PO number mapping for Case 2
          lotPoMap.set(kdLotNo, poNumber);

          // Check if any adjustment column has data
          const hasAdjustment =
            (adjustDateRaw !== null &&
              adjustDateRaw !== undefined &&
              adjustDateRaw !== "") ||
            (adjustTimeRaw !== null &&
              adjustTimeRaw !== undefined &&
              adjustTimeRaw !== "") ||
            (adjustQtyRaw !== null &&
              adjustQtyRaw !== undefined &&
              adjustQtyRaw !== "");

          // Track lot for Case 2 processing (all lots in Excel should be tracked)
          if (kdLotNo) {
            adjustedLots.add(kdLotNo);
          }

          // Skip if no lot number
          if (!kdLotNo) {
            continue;
          }

          // Build update object
          const updateData: any = {
            poNumber, // Always update poNumber from Excel
          };

          // Only add adjustment fields if hasAdjustment is true
          if (hasAdjustment) {
            if (
              adjustDateRaw !== null &&
              adjustDateRaw !== undefined &&
              adjustDateRaw !== ""
            ) {
              updateData.adjustDate = excelDateToDMY(adjustDateRaw, true);
            }

            if (
              adjustTimeRaw !== null &&
              adjustTimeRaw !== undefined &&
              adjustTimeRaw !== ""
            ) {
              updateData.adjustTime = excelTimeToHM(Number(adjustTimeRaw));
            }

            if (
              adjustQtyRaw !== null &&
              adjustQtyRaw !== undefined &&
              adjustQtyRaw !== ""
            ) {
              updateData.qty = Number(adjustQtyRaw);
            }
          }

          // Find existing delivery by kdLotNo + partNumber + customerId
          const existingDelivery = await db
            .select()
            .from(deliveries)
            .where(
              and(
                eq(deliveries.kdLotNo, kdLotNo),
                eq(deliveries.partNumber, partNumber),
                eq(deliveries.customerId, customer.id),
              ),
            )
            .limit(1);

          if (existingDelivery.length === 0) {
            notFoundCount++;
            errors.push({
              sheet: sheetName,
              row: i + 1,
              kdLotNo,
              partNumber,
              error: "Pengiriman tidak ditemukan",
            });
            continue;
          }

          const currentDelivery = existingDelivery[0];

          // Track adjusted lot and delivery for Case 2 processing
          adjustedLots.add(kdLotNo);
          adjustedDeliveryIds.add(currentDelivery.id);

          // If preview mode, collect preview data without updating
          if (preview) {
            // Calculate what would change
            const changes: any = {
              deliveryId: currentDelivery.id,
              kdLotNo,
              partNumber,
              sheet: sheetName,
              row: i + 1,
              currentValues: {
                date: currentDelivery.date,
                time: currentDelivery.time,
                qty: currentDelivery.qty,
                poNumber: currentDelivery.poNumber,
              },
              newValues: { ...updateData },
              hasChanges: false,
            };

            // Check each field for changes
            if (updateData.adjustDate !== undefined) {
              changes.currentValues.adjustDate = currentDelivery.adjustDate;
              changes.hasChanges =
                changes.hasChanges ||
                updateData.adjustDate !== currentDelivery.adjustDate;
            }

            if (updateData.adjustTime !== undefined) {
              changes.currentValues.adjustTime = currentDelivery.adjustTime;
              changes.hasChanges =
                changes.hasChanges ||
                updateData.adjustTime !== currentDelivery.adjustTime;
            }

            if (updateData.qty !== undefined) {
              changes.currentValues.qty = currentDelivery.qty;
              changes.hasChanges =
                changes.hasChanges || updateData.qty !== currentDelivery.qty;
            }

            if (updateData.poNumber !== undefined) {
              changes.hasChanges =
                changes.hasChanges ||
                updateData.poNumber !== currentDelivery.poNumber;
            }

            // Only add to previewData if there are actual changes
            if (changes.hasChanges) {
              previewData.push(changes);
              case1UpdatedCount++;
            }
          } else {
            // Update delivery (actual mode)
            const [updatedDelivery] = await db
              .update(deliveries)
              .set({
                ...updateData,
                updatedAt: new Date(),
              })
              .where(eq(deliveries.id, existingDelivery[0].id))
              .returning();

            case1UpdatedCount++;
            revisionDetails.push({
              sheet: sheetName,
              deliveryId: updatedDelivery.id,
              kdLotNo,
              partNumber,
              newValues: updateData,
              case: 1,
            });
          }
        }
      }

      console.log(adjustedLots);

      // Case 2: For lots that have adjustments, update other deliveries in the same lot
      // Copy date/time from database to adjust_date/adjust_time for parts that weren't adjusted
      for (const kdLotNo of Array.from(adjustedLots)) {
        // Get PO number for this lot
        const lotPoNumber = lotPoMap.get(kdLotNo);

        // Find all deliveries in this lot that weren't adjusted in Case 1
        const otherDeliveriesInLot = await db
          .select()
          .from(deliveries)
          .where(
            and(
              eq(deliveries.kdLotNo, kdLotNo),
              eq(deliveries.customerId, customer.id),
            ),
          );

        for (const delivery of otherDeliveriesInLot) {
          // Skip if this delivery was already adjusted in Case 1
          if (adjustedDeliveryIds.has(delivery.id)) {
            continue;
          }

          // Skip if already has adjustment data
          if (delivery.adjustDate || delivery.adjustTime) {
            continue;
          }

          const updateData: any = {
            poNumber: lotPoNumber, // Update PO number from Excel mapping
          };

          // Copy date -> adjustDate if not empty
          if (delivery.date && !delivery.adjustDate) {
            updateData.adjustDate = delivery.date;
          }

          // Copy time -> adjustTime if not empty
          if (delivery.time && !delivery.adjustTime) {
            updateData.adjustTime = delivery.time;
          }

          // Only update if there's something to update
          if (Object.keys(updateData).length > 0) {
            if (preview) {
              // Add to preview data
              const changes: any = {
                deliveryId: delivery.id,
                kdLotNo: delivery.kdLotNo,
                partNumber: delivery.partNumber,
                case: 2,
                currentValues: {
                  date: delivery.date,
                  time: delivery.time,
                  adjustDate: delivery.adjustDate,
                  adjustTime: delivery.adjustTime,
                  poNumber: delivery.poNumber,
                },
                newValues: { ...updateData },
                hasChanges: true,
              };
              previewData.push(changes);
              case2UpdatedCount++;
            } else {
              // Actual update
              const [updatedDelivery] = await db
                .update(deliveries)
                .set({
                  ...updateData,
                  updatedAt: new Date(),
                })
                .where(eq(deliveries.id, delivery.id))
                .returning();

              case2UpdatedCount++;
              revisionDetails.push({
                deliveryId: updatedDelivery.id,
                kdLotNo: updatedDelivery.kdLotNo,
                partNumber: updatedDelivery.partNumber,
                newValues: updateData,
                case: 2,
              });
            }
          }
        }
      }

      // Calculate total updated count
      updatedCount = case1UpdatedCount + case2UpdatedCount;

      // Send email notification if not preview mode and there are successful updates
      let emailResult: { success: boolean; error?: string } | undefined;
      console.log("preview:", preview, "update count:", updatedCount);
      if (!preview && updatedCount > 0) {
        try {
          // Get user information
          const userId = c.get("userId") as string;
          const userResult = await db
            .select({
              id: users.id,
              fullName: users.fullName,
              username: users.username,
            })
            .from(users)
            .where(eq(users.id, userId))
            .limit(1);

          const userName = userResult[0]?.fullName || userResult[0]?.username || "Unknown User";

          // Get email recipients from config
          const configResult = await db
            .select()
            .from(configs)
            .where(eq(configs.key, "REVISION_EMAIL_NOTIF"))
            .limit(1);

          if (configResult.length > 0) {
            const config = configResult[0];
            let recipients: string[] = [];

            // Parse value as array
            if (Array.isArray(config.value)) {
              recipients = config.value;
            } else if (typeof config.value === "string") {
              try {
                recipients = JSON.parse(config.value);
              } catch {
                console.error(
                  "Failed to parse REVISION_EMAIL_NOTIF config value",
                );
              }
            }

            if (recipients.length > 0) {
              emailResult = await sendRevisionNotificationEmail(
                recipients,
                customer.name,
                customer.alias,
                revisionDetails,
                fileBuffer,
                file.name,
                userName,
              );
            }
          }
        } catch (emailError) {
          console.error(
            "Error sending revision notification email:",
            emailError,
          );
          emailResult = {
            success: false,
            error:
              emailError instanceof Error
                ? emailError.message
                : "Unknown email error",
          };
        }
      }

      return c.json({
        message: preview ? "Preview revisi siap" : "Impor revisi selesai",
        preview: preview,
        customer: {
          id: customer.id,
          name: customer.name,
          alias: customer.alias,
        },
        summary: {
          updated: updatedCount,
          case1Updated: case1UpdatedCount,
          case2Updated: case2UpdatedCount,
          notFound: notFoundCount,
          errors: errors.length,
          total: updatedCount + notFoundCount,
        },
        errors: errors.length > 0 ? errors : undefined,
        details: preview ? previewData : revisionDetails,
        emailNotification: emailResult
          ? {
              sent: emailResult.success,
              message:
                emailResult.error || "Email notification sent successfully",
            }
          : undefined,
      });
    } catch (error) {
      console.error("Revision import error:", error);
      return c.json(
        {
          error: "Kesalahan internal server",
          details:
            error instanceof Error
              ? error.message
              : "Kesalahan tidak diketahui",
        },
        500,
      );
    }
  },
);

export { deliveriesRoute as deliveries };
