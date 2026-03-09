import { Hono } from "hono";
import { z } from "zod";
import { db } from "../lib/db";
import { scanLogs, customers, deliveries, users } from "../lib/schema";
import { eq, desc, and, gte, lte, count } from "drizzle-orm";
import { authMiddleware, roleValidationMiddleware } from "../middleware/auth";
import { scanLogSchema, localScanLogSchema } from "../schemas";

const scanLogsRoute = new Hono();

// Apply auth middleware to all routes
scanLogsRoute.use("*", authMiddleware);

// POST endpoint to create scan log
scanLogsRoute.post(
  "/",
  roleValidationMiddleware(["preparation", "delivery", "admin"]),
  async (c) => {
    try {
      return c.json({
        message: "Scan log created successfully",
        scanLog: null,
      });
      // const body = await c.req.json();
      // const data = scanLogSchema.parse(body);
      // console.log('scan log parse', {data})

      // // Verify customer exists
      // const customerResult = await db
      //   .select()
      //   .from(customers)
      //   .where(eq(customers.id, data.customerId))
      //   .limit(1);

      // const customer = customerResult[0];

      // if (!customer) {
      //   return c.json({ error: "Customer not found" }, 404);
      // }

      // // If deliveryId is provided, verify it exists
      // if (data.deliveryId) {
      //   const deliveryResult = await db
      //     .select()
      //     .from(deliveries)
      //     .where(eq(deliveries.id, data.deliveryId))
      //     .limit(1);

      //   const delivery = deliveryResult[0];

      //   if (!delivery) {
      //     return c.json({ error: "Delivery not found" }, 404);
      //   }
      // }

      // // Create scan log
      // const [scanLog] = await db
      //   .insert(scanLogs)
      //   // @ts-ignore
      //   .values({...data, customer: customer.name})
      //   .returning();

      // return c.json({
      //   message: "Scan log created successfully",
      //   scanLog,
      // });
    } catch (error) {
      console.log('error', error)
      if (error instanceof z.ZodError) {
        return c.json({ error: error.issues[0].message }, 400);
      }
      return c.json({ error: "Internal server error" }, 500);
    }
  }
);

// GET endpoint to retrieve scan logs with filters
scanLogsRoute.get(
  "/",
  roleValidationMiddleware(["admin", "user", "supervisor"]),
  async (c) => {
    try {
      const page = parseInt(c.req.query("page") || "1");
      const limit = parseInt(c.req.query("perPage") || "10");
      const customerId = c.req.query("customerId");
      const lot = c.req.query("lot");
      const createdDateFrom = c.req.query("createdDateFrom");
      const createdDateTo = c.req.query("createdDateTo");

      const skip = (page - 1) * limit;

      // Build where conditions
      const whereConditions = [];

      if (customerId) {
        whereConditions.push(eq(scanLogs.customerId, customerId));
      }

      if (lot) {
        whereConditions.push(eq(scanLogs.lot, lot));
      }

      // Filter by created date range
      if (createdDateFrom) {
        // Validate date format (YYYY-MM-DD)
        const dateFormatRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateFormatRegex.test(createdDateFrom)) {
          return c.json(
            {
              error:
                "Invalid createdDateFrom format. Use YYYY-MM-DD format (e.g., 2025-01-01)",
            },
            400
          );
        }

        // Convert to Date object (start of day)
        const fromDate = new Date(createdDateFrom);
        fromDate.setHours(0, 0, 0, 0);
        whereConditions.push(gte(scanLogs.createdAt, fromDate));
      }

      if (createdDateTo) {
        // Validate date format (YYYY-MM-DD)
        const dateFormatRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateFormatRegex.test(createdDateTo)) {
          return c.json(
            {
              error:
                "Invalid createdDateTo format. Use YYYY-MM-DD format (e.g., 2025-01-01)",
            },
            400
          );
        }

        // Convert to Date object (end of day)
        const toDate = new Date(createdDateTo);
        toDate.setHours(23, 59, 59, 999);
        whereConditions.push(lte(scanLogs.createdAt, toDate));
      }

      const where =
        whereConditions.length > 0 ? and(...whereConditions) : undefined;

      // Get scan logs with pagination, joined with deliveries and users
      const [scanLogsData, totalResult] = await Promise.all([
        db
          .select({
            id: scanLogs.id,
            customerId: scanLogs.customerId,
            customer: scanLogs.customer,
            deliveryId: scanLogs.deliveryId,
            partNumber: scanLogs.partNumber,
            partName: scanLogs.partName,
            colorCode: scanLogs.colorCode,
            lot: scanLogs.lot,
            deliveryYear: scanLogs.deliveryYear,
            scanBy: scanLogs.scanBy,
            scanType: scanLogs.scanType,
            kasaiBarcode: scanLogs.kasaiBarcode,
            customerBarcode: scanLogs.customerBarcode,
            scanStatus: scanLogs.scanStatus,
            createdAt: scanLogs.createdAt,
            // Delivery fields
            orderNo: deliveries.orderNo,
            slipNumber: deliveries.slipNumber,
            seqProd: deliveries.seqProd,
            // User fields
            scannedByName: users.fullName,
            scannedByUsername: users.username,
          })
          .from(scanLogs)
          .leftJoin(deliveries, eq(scanLogs.deliveryId, deliveries.id))
          .leftJoin(users, eq(scanLogs.scanBy, users.id))
          .where(where)
          .limit(limit)
          .offset(skip)
          .orderBy(desc(scanLogs.createdAt)),
        db.select({ count: count() }).from(scanLogs).where(where),
      ]);

      const total = totalResult[0]?.count || 0;

      return c.json({
        result: scanLogsData,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.log(error);
      return c.json({ error: "Internal server error" }, 500);
    }
  }
);

// GET endpoint to retrieve scan log by ID
scanLogsRoute.get(
  "/:id",
  roleValidationMiddleware(["admin", "user", "supervisor"]),
  async (c) => {
    try {
      const id = c.req.param("id");

      const scanLogResult = await db
        .select({
          id: scanLogs.id,
          customerId: scanLogs.customerId,
          customer: scanLogs.customer,
          deliveryId: scanLogs.deliveryId,
          partNumber: scanLogs.partNumber,
          partName: scanLogs.partName,
          colorCode: scanLogs.colorCode,
          lot: scanLogs.lot,
          deliveryYear: scanLogs.deliveryYear,
          scanBy: scanLogs.scanBy,
          scanType: scanLogs.scanType,
          kasaiBarcode: scanLogs.kasaiBarcode,
          customerBarcode: scanLogs.customerBarcode,
          scanStatus: scanLogs.scanStatus,
          createdAt: scanLogs.createdAt,
          // Delivery fields
          orderNo: deliveries.orderNo,
          slipNumber: deliveries.slipNumber,
          seqProd: deliveries.seqProd,
          // User fields
          scannedByName: users.fullName,
          scannedByUsername: users.username,
        })
        .from(scanLogs)
        .leftJoin(deliveries, eq(scanLogs.deliveryId, deliveries.id))
        .leftJoin(users, eq(scanLogs.scanBy, users.id))
        .where(eq(scanLogs.id, id))
        .limit(1);

      const scanLog = scanLogResult[0];

      if (!scanLog) {
        return c.json({ error: "Scan log not found" }, 404);
      }

      return c.json({ scanLog });
    } catch (error) {
      console.log(error);
      return c.json({ error: "Internal server error" }, 500);
    }
  }
);

// =============================================================================
// MOBILE SCAN LOG SYNC ENDPOINTS
// These endpoints handle detailed event logs from mobile scanners
// =============================================================================

// POST endpoint to sync local scan logs from mobile
scanLogsRoute.post(
  "/local",
  roleValidationMiddleware(["preparation", "delivery", "admin"]),
  async (c) => {
    try {
      const body = await c.req.json();
      console.log('Mobile scan log sync request:', { logsCount: Array.isArray(body) ? body.length : 1, body: JSON.stringify(body) });

      // Handle both single log and array of logs
      const logsArray = Array.isArray(body) ? body : [body];

      const results = [];
      const errors = [];

      for (const logData of logsArray) {
        try {
          const validatedData = localScanLogSchema.parse(logData);

          // Verify customer exists
          const customerResult = await db
            .select()
            .from(customers)
            .where(eq(customers.id, validatedData.customerId))
            .limit(1);

          const customer = customerResult[0];

          if (!customer) {
            errors.push({
              logId: validatedData.logId || 'unknown',
              error: "Customer not found",
            });
            continue;
          }

          // Check if log already exists (by id)
          const existing = await db
            .select()
            .from(scanLogs)
            .where(eq(scanLogs.id, validatedData.logId))
            .limit(1);

          if (existing.length > 0) {
            // Log already synced, skip but acknowledge
            results.push({
              logId: validatedData.logId,
              status: "already_synced",
              message: "Log already exists in server",
            });
            continue;
          }

          // Map local scan log to scan_logs table
          const [insertedLog] = await db
            .insert(scanLogs)
            .values({
              id: validatedData.logId,
              customerId: validatedData.customerId,
              customer: customer.alias,
              scanBy: validatedData.userId,
              scanType: validatedData.scanType,
              lot: validatedData.lotNumber,
              deviceId: validatedData.deviceId,
              userId: validatedData.userId,
              sessionStatus: validatedData.status,
              startTime: validatedData.startTime ? new Date(validatedData.startTime) : null,
              endTime: validatedData.endTime ? new Date(validatedData.endTime) : null,
              events: validatedData.events,
              syncedAt: new Date(),
              createdAt: new Date(),
              updatedAt: new Date(),
            })
            .returning();

          results.push({
            logId: insertedLog.id,
            status: "synced",
            message: "Log synced successfully",
          });
        } catch (error: any) {
          console.error('Error syncing individual log:', error);
          errors.push({
            logId: logData.logId || 'unknown',
            error: error instanceof z.ZodError ? error.issues[0].message : error.message || "Failed to sync log",
          });
        }
      }

      return c.json({
        message: "Mobile scan logs sync completed",
        synced: results.length,
        failed: errors.length,
        results,
        errors,
      });
    } catch (error: any) {
      console.error('Mobile scan logs sync error:', error);
      if (error instanceof z.ZodError) {
        return c.json({ error: error.issues[0].message }, 400);
      }
      return c.json({ error: "Internal server error" }, 500);
    }
  }
);

// GET endpoint to retrieve mobile scan logs with filters
scanLogsRoute.get(
  "/local",
  roleValidationMiddleware(["admin", "supervisor"]),
  async (c) => {
    try {
      const page = parseInt(c.req.query("page") || "1");
      const limit = parseInt(c.req.query("perPage") || "50");
      const customerId = c.req.query("customerId");
      const userId = c.req.query("userId");
      const deviceId = c.req.query("deviceId");
      const lotNumber = c.req.query("lotNumber");
      const sessionStatus = c.req.query("sessionStatus");

      const skip = (page - 1) * limit;

      // Build where conditions
      const whereConditions = [];

      if (customerId) {
        whereConditions.push(eq(scanLogs.customerId, customerId));
      }

      if (userId) {
        whereConditions.push(eq(scanLogs.userId, userId));
      }

      if (deviceId) {
        whereConditions.push(eq(scanLogs.deviceId, deviceId));
      }

      if (lotNumber) {
        whereConditions.push(eq(scanLogs.lot, lotNumber));
      }

      if (sessionStatus) {
        whereConditions.push(eq(scanLogs.sessionStatus, sessionStatus));
      }

      const where =
        whereConditions.length > 0
          ? and(...whereConditions)
          : undefined;

      // Get scan logs with pagination and detailed event logs
      const [logsData, totalResult] = await Promise.all([
        db
          .select({
            id: scanLogs.id,
            customerId: scanLogs.customerId,
            customerName: customers.name,
            userId: scanLogs.userId,
            userName: users.fullName,
            scanType: scanLogs.scanType,
            deviceId: scanLogs.deviceId,
            lotNumber: scanLogs.lot,
            sessionStatus: scanLogs.sessionStatus,
            startTime: scanLogs.startTime,
            endTime: scanLogs.endTime,
            events: scanLogs.events,
            syncedAt: scanLogs.syncedAt,
            createdAt: scanLogs.createdAt,
          })
          .from(scanLogs)
          .leftJoin(customers, eq(scanLogs.customerId, customers.id))
          .leftJoin(users, eq(scanLogs.userId, users.id))
          .where(where)
          .limit(limit)
          .offset(skip)
          .orderBy(desc(scanLogs.createdAt)),
        db.select({ count: count() }).from(scanLogs).where(where),
      ]);

      const total = totalResult[0]?.count || 0;

      return c.json({
        result: logsData,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.log(error);
      return c.json({ error: "Internal server error" }, 500);
    }
  }
);

// GET endpoint to retrieve mobile scan log by ID
scanLogsRoute.get(
  "/local/:logId",
  roleValidationMiddleware(["admin", "supervisor"]),
  async (c) => {
    try {
      const logId = c.req.param("logId");

      const logResult = await db
        .select({
          id: scanLogs.id,
          customerId: scanLogs.customerId,
          customerName: customers.name,
          userId: scanLogs.userId,
          userName: users.fullName,
          scanType: scanLogs.scanType,
          deviceId: scanLogs.deviceId,
          lotNumber: scanLogs.lot,
          sessionStatus: scanLogs.sessionStatus,
          startTime: scanLogs.startTime,
          endTime: scanLogs.endTime,
          events: scanLogs.events,
          syncedAt: scanLogs.syncedAt,
          createdAt: scanLogs.createdAt,
        })
        .from(scanLogs)
        .leftJoin(customers, eq(scanLogs.customerId, customers.id))
        .leftJoin(users, eq(scanLogs.userId, users.id))
        .where(eq(scanLogs.id, logId))
        .limit(1);

      const log = logResult[0];

      if (!log) {
        return c.json({ error: "Scan log not found" }, 404);
      }

      return c.json({ log });
    } catch (error) {
      console.log(error);
      return c.json({ error: "Internal server error" }, 500);
    }
  }
);

export { scanLogsRoute as scanLogs };
