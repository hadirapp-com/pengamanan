import { Hono } from "hono";
import { z } from "zod";
import { db } from "../lib/db";
import { qrCodes } from "../lib/schema";
import { eq, and, desc, sql, or } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth";
import QRCode from "qrcode";
import { jsPDF } from "jspdf";

const qrRoutes = new Hono();

// Apply auth middleware to all routes
qrRoutes.use("/*", authMiddleware);

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const createQrSchema = z.object({
  nama: z.string().min(1, "Nama is required").max(255, "Nama must not exceed 255 characters"),
  penanggungJawab: z.string().min(1, "Penanggung jawab is required").max(255),
  validFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Valid from must be in YYYY-MM-DD format"),
  validUntil: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Valid until must be in YYYY-MM-DD format"),
});

const updateQrSchema = z.object({
  nama: z.string().min(1).max(255).optional(),
  penanggungJawab: z.string().min(1).max(255).optional(),
  validFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  validUntil: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  isActive: z.boolean().optional(),
});

const listQrSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
  validFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  validUntil: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

const generateQrSchema = z.object({
  count: z.coerce.number().int().positive().max(100).default(1),
});

const qrIdsSchema = z.object({
  ids: z.array(z.string()).min(1, "At least one QR ID is required").max(50, "Cannot generate more than 50 QRs at once"),
});

// ============================================================================
// ROUTES
// ============================================================================

/**
 * GET /qr
 * List QR codes with pagination and filtering
 */
qrRoutes.get("/", async (c) => {
  try {
    const queryParams = c.req.query();
    const validationResult = listQrSchema.safeParse(queryParams);

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

    const { page, limit, search, isActive, validFrom, validUntil } = validationResult.data;
    const offset = (page - 1) * limit;

    // Build conditions
    const conditions = [];

    // Exclude soft-deleted records
    conditions.push(sql`${qrCodes.deletedAt} IS NULL`);

    // Filter by isActive
    if (isActive !== undefined) {
      conditions.push(eq(qrCodes.isActive, isActive));
    }

    // Filter by validity period
    if (validFrom) {
      conditions.push(sql`${qrCodes.validUntil} >= ${new Date(validFrom)}`);
    }
    if (validUntil) {
      conditions.push(sql`${qrCodes.validFrom} <= ${new Date(validUntil)}`);
    }

    // Search by nama or penanggung jawab
    if (search) {
      conditions.push(
        or(
          sql`${qrCodes.nama} ILIKE ${`%${search}%`}`,
          sql`${qrCodes.penanggungJawab} ILIKE ${`%${search}%`}`
        )
      );
    }

    // Combine all conditions with AND
    const whereClause =
      conditions.length > 1 ? and(...conditions) : conditions[0];

    // Get total count
    const totalCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(qrCodes)
      .where(whereClause);

    const totalCount = totalCountResult[0]?.count || 0;
    const totalPages = Math.ceil(totalCount / limit);

    // Get QR codes
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
      .where(whereClause)
      .orderBy(desc(qrCodes.createdAt))
      .limit(limit)
      .offset(offset);

    return c.json({
      success: true,
      data: qrList,
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
    console.error("List QR codes error:", error);
    return c.json(
      {
        success: false,
        error: "Internal Server Error",
        message: "An error occurred while fetching QR codes",
      },
      500
    );
  }
});

/**
 * GET /qr/:id
 * Get QR code by ID
 */
qrRoutes.get("/:id", async (c) => {
  try {
    const qrId = c.req.param("id");

    const qrResult = await db
      .select()
      .from(qrCodes)
      .where(eq(qrCodes.id, qrId))
      .limit(1);

    if (qrResult.length === 0) {
      return c.json(
        {
          success: false,
          error: "Not Found",
          message: "QR code not found",
        },
        404
      );
    }

    return c.json({
      success: true,
      data: qrResult[0],
    });
  } catch (error) {
    console.error("Get QR code error:", error);
    return c.json(
      {
        success: false,
        error: "Internal Server Error",
        message: "An error occurred while fetching QR code",
      },
      500
    );
  }
});

/**
 * POST /qr
 * Create new QR code
 */
qrRoutes.post("/", async (c) => {
  try {
    const currentUser = c.get("user");
    const body = await c.req.json();
    const validationResult = createQrSchema.safeParse(body);

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

    const { nama, penanggungJawab, validFrom, validUntil } = validationResult.data;

    // Validate validity period - compare date strings directly since they're in YYYY-MM-DD format
    if (validFrom > validUntil) {
      return c.json(
        {
          success: false,
          error: "Validation Error",
          message: "validFrom must be before or equal to validUntil",
        },
        400
      );
    }

    // Generate UUID for QR code
    const qrCodeId = crypto.randomUUID();

    // Create QR code - keep dates as strings for PostgreSQL DATE type
    const newQrResult = await db
      .insert(qrCodes)
      .values({
        qrCode: qrCodeId,
        nama,
        penanggungJawab,
        validFrom, // Keep as string in YYYY-MM-DD format
        validUntil, // Keep as string in YYYY-MM-DD format
        createdBy: currentUser.userId,
        updatedBy: currentUser.userId,
      })
      .returning();

    return c.json(
      {
        success: true,
        message: "QR code created successfully",
        data: newQrResult[0],
      },
      201
    );
  } catch (error) {
    console.error("Create QR code error:", error);
    return c.json(
      {
        success: false,
        error: "Internal Server Error",
        message: "An error occurred while creating QR code",
      },
      500
    );
  }
});

/**
 * PUT /qr/:id
 * Update QR code
 */
qrRoutes.put("/:id", async (c) => {
  try {
    const currentUser = c.get("user");
    const qrId = c.req.param("id");
    const body = await c.req.json();
    const validationResult = updateQrSchema.safeParse(body);

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

    const updateData = validationResult.data;

    // Check if QR code exists
    const existingQr = await db
      .select()
      .from(qrCodes)
      .where(eq(qrCodes.id, qrId))
      .limit(1);

    if (existingQr.length === 0) {
      return c.json(
        {
          success: false,
          error: "Not Found",
          message: "QR code not found",
        },
        404
      );
    }

    // Validate validity period if both dates are provided
    if (updateData.validFrom && updateData.validUntil) {
      // Compare date strings directly since they're in YYYY-MM-DD format
      if (updateData.validFrom > updateData.validUntil) {
        return c.json(
          {
            success: false,
            error: "Validation Error",
            message: "validFrom must be before or equal to validUntil",
          },
          400
        );
      }
    }

    // Prepare update data - only include fields that are provided
    const finalUpdateData: any = {
      updatedBy: currentUser.userId,
      updatedAt: new Date(),
    };

    // Only include fields that are provided in the request
    if (updateData.nama !== undefined) finalUpdateData.nama = updateData.nama;
    if (updateData.penanggungJawab !== undefined) finalUpdateData.penanggungJawab = updateData.penanggungJawab;
    if (updateData.isActive !== undefined) finalUpdateData.isActive = updateData.isActive;
    // For date fields, keep them as strings in YYYY-MM-DD format for PostgreSQL DATE type
    if (updateData.validFrom !== undefined) finalUpdateData.validFrom = updateData.validFrom;
    if (updateData.validUntil !== undefined) finalUpdateData.validUntil = updateData.validUntil;

    // Update QR code
    const updatedQrResult = await db
      .update(qrCodes)
      .set(finalUpdateData)
      .where(eq(qrCodes.id, qrId))
      .returning();

    return c.json({
      success: true,
      message: "QR code updated successfully",
      data: updatedQrResult[0],
    });
  } catch (error) {
    console.error("Update QR code error:", error);
    return c.json(
      {
        success: false,
        error: "Internal Server Error",
        message: "An error occurred while updating QR code",
      },
      500
    );
  }
});

/**
 * DELETE /qr/:id
 * Soft delete QR code
 */
qrRoutes.delete("/:id", async (c) => {
  try {
    const currentUser = c.get("user");
    const qrId = c.req.param("id");

    // Check if QR code exists
    const existingQr = await db
      .select()
      .from(qrCodes)
      .where(eq(qrCodes.id, qrId))
      .limit(1);

    if (existingQr.length === 0) {
      return c.json(
        {
          success: false,
          error: "Not Found",
          message: "QR code not found",
        },
        404
      );
    }

    // Soft delete QR code
    await db
      .update(qrCodes)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
        updatedBy: currentUser.userId,
      })
      .where(eq(qrCodes.id, qrId));

    return c.json({
      success: true,
      message: "QR code deleted successfully",
    });
  } catch (error) {
    console.error("Delete QR code error:", error);
    return c.json(
      {
        success: false,
        error: "Internal Server Error",
        message: "An error occurred while deleting QR code",
      },
      500
    );
  }
});

/**
 * POST /qr/generate
 * Generate new UUIDs for QR codes (without saving to DB)
 */
qrRoutes.post("/generate", async (c) => {
  try {
    const body = await c.req.json();
    const validationResult = generateQrSchema.safeParse(body);

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

    const { count } = validationResult.data;

    // Generate UUIDs
    const uuids = Array.from({ length: count }, () => crypto.randomUUID());

    return c.json({
      success: true,
      data: {
        count,
        uuids,
      },
    });
  } catch (error) {
    console.error("Generate QR codes error:", error);
    return c.json(
      {
        success: false,
        error: "Internal Server Error",
        message: "An error occurred while generating QR codes",
      },
      500
    );
  }
});

/**
 * GET /qr/:id/image
 * Generate QR code image (PNG)
 */
qrRoutes.get("/:id/image", async (c) => {
  try {
    const qrId = c.req.param("id");

    // Get QR code from database
    const qrResult = await db
      .select({ qrCode: qrCodes.qrCode, nama: qrCodes.nama })
      .from(qrCodes)
      .where(eq(qrCodes.id, qrId))
      .limit(1);

    if (qrResult.length === 0) {
      return c.json(
        {
          success: false,
          error: "Not Found",
          message: "QR code not found",
        },
        404
      );
    }

    const { qrCode, nama } = qrResult[0];

    // Generate QR code as PNG buffer
    const qrImageBuffer = await QRCode.toBuffer(qrCode, {
      type: "png",
      width: 300,
      margin: 2,
      errorCorrectionLevel: "M",
    });

    // Return PNG image
    return new Response(qrImageBuffer, {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `attachment; filename="qr-${nama}.png"`,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Generate QR image error:", error);
    return c.json(
      {
        success: false,
        error: "Internal Server Error",
        message: "An error occurred while generating QR image",
      },
      500
    );
  }
});

/**
 * POST /qr/pdf
 * Generate PDF for multiple QR codes
 */
qrRoutes.post("/pdf", async (c) => {
  try {
    const body = await c.req.json();
    const validationResult = qrIdsSchema.safeParse(body);

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

    const { ids } = validationResult.data;

    // Get QR codes from database
    const qrCodesList = await db
      .select({
        qrCode: qrCodes.qrCode,
        nama: qrCodes.nama,
        penanggungJawab: qrCodes.penanggungJawab,
      })
      .from(qrCodes)
      .where(sql`${qrCodes.id} = any(${ids})`);

    if (qrCodesList.length === 0) {
      return c.json(
        {
          success: false,
          error: "Not Found",
          message: "No valid QR codes found",
        },
        404
      );
    }

    // Create PDF
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const qrSize = 50;
    const spacing = 20;

    let x = margin;
    let y = margin + 20;
    let col = 0;
    const maxCols = Math.floor((pageWidth - 2 * margin) / (qrSize + spacing));

    // Title
    pdf.setFontSize(16);
    pdf.text("QR Codes - Pengamanan Lebaran 2026", pageWidth / 2, 15, { align: "center" });
    pdf.setFontSize(10);
    pdf.text(`Generated: ${new Date().toLocaleString("id-ID")}`, pageWidth / 2, 22, { align: "center" });

    for (const qr of qrCodesList) {
      // Check if we need a new page
      if (y + qrSize + 30 > pageHeight - margin) {
        pdf.addPage();
        y = margin + 10;
        col = 0;
      }

      // Generate QR code image
      const qrImageBuffer = await QRCode.toBuffer(qr.qrCode, {
        type: "png",
        width: qrSize * 2,
        margin: 1,
      });

      const qrImageBase64 = Buffer.from(qrImageBuffer).toString("base64");
      const qrImageDataUrl = `data:image/png;base64,${qrImageBase64}`;

      // Add QR image
      pdf.addImage(qrImageDataUrl, "PNG", x, y, qrSize, qrSize);

      // Add nama and penanggung jawab below QR
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "bold");
      pdf.text(qr.nama, x + qrSize / 2, y + qrSize + 7, { align: "center", maxWidth: qrSize });
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.text(qr.penanggungJawab, x + qrSize / 2, y + qrSize + 14, { align: "center", maxWidth: qrSize });

      // Move to next position
      col++;
      if (col >= maxCols) {
        col = 0;
        x = margin;
        y += qrSize + 30;
      } else {
        x += qrSize + spacing;
      }
    }

    // Generate PDF buffer
    const pdfBuffer = Buffer.from(pdf.output("arraybuffer"));

    // Return PDF
    return new Response(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="qr-codes-${Date.now()}.pdf"`,
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Generate PDF error:", error);
    return c.json(
      {
        success: false,
        error: "Internal Server Error",
        message: "An error occurred while generating PDF",
      },
      500
    );
  }
});

export default qrRoutes;
