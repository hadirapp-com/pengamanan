import { Hono } from "hono";
import { z } from "zod";
import { db } from "../lib/db";
import {
  parts,
  customers,
  partsPrintHistory,
  lower,
  users,
} from "../lib/schema";
import {
  eq,
  desc,
  asc,
  like,
  ilike,
  or,
  count,
  and,
  isNull,
  isNotNull,
} from "drizzle-orm";
import { authMiddleware, roleValidationMiddleware } from "../middleware/auth";
import {
  partSchema,
  partUpdateSchema,
  partImportSchema,
  printHistorySchema,
} from "../schemas";
import * as XLSX from "xlsx";
import { HonoContext } from "../schemas";

const partsRoute = new Hono<{ Variables: HonoContext }>();

// Apply auth middleware to all routes
partsRoute.use("*", authMiddleware);

// Get all parts with customer information - accessible by both admin and user roles
partsRoute.get("/", roleValidationMiddleware(["*"]), async (c) => {
  try {
    const page = parseInt(c.req.query("page") || "1");
    const perPage = parseInt(
      c.req.query("perPage") || c.req.query("limit") || "10",
    );
    const search = c.req.query("search");
    const sortCol = c.req.query("sortCol") || "created_at";
    const sortDir = c.req.query("sortDir") || "DESC";

    // Column-specific filters
    const filterNo = c.req.query("filter_no");
    const filterName = c.req.query("filter_name");
    const filterColorCode = c.req.query("filter_colorCode");
    const filterModel = c.req.query("filter_model");
    const filterCustomerId = c.req.query("filter_customerId");

    const skip = (page - 1) * perPage;

    let whereConditions = [];

    // General search across multiple columns
    if (search) {
      whereConditions.push(
        or(
          like(parts.name, `%${search}%`),
          like(parts.no, `%${search}%`),
          like(parts.colorCode, `%${search}%`),
          like(parts.model, `%${search}%`),
        ),
      );
    }

    // Column-specific filters
    if (filterNo) {
      whereConditions.push(ilike(parts.no, `%${filterNo}%`));
    }

    if (filterName) {
      whereConditions.push(ilike(parts.name, `%${filterName}%`));
    }

    if (filterColorCode) {
      whereConditions.push(ilike(parts.colorCode, `%${filterColorCode}%`));
    }

    if (filterModel) {
      whereConditions.push(ilike(parts.model, `%${filterModel}%`));
    }

    if (filterCustomerId) {
      whereConditions.push(eq(parts.customerId, filterCustomerId));
    }

    // Add condition to exclude soft-deleted records
    whereConditions.push(isNull(parts.deletedAt));

    const where =
      whereConditions.length > 0 ? and(...whereConditions) : undefined;

    // Determine sort column and direction
    const sortColumnMap: Record<string, any> = {
      created_at: parts.createdAt,
      updated_at: parts.updatedAt,
      name: parts.name,
      no: parts.no,
      colorCode: parts.colorCode,
      model: parts.model,
    };

    const sortColumn = sortColumnMap[sortCol] || parts.createdAt;
    const sortOrder = sortDir.toUpperCase() === "ASC" ? asc : desc;

    const [partsData, totalResult] = await Promise.all([
      db
        .select({
          id: parts.id,
          name: parts.name,
          no: parts.no,
          colorCode: parts.colorCode,
          customerId: parts.customerId,
          model: parts.model,
          qtyPerPack: parts.qtyPerPack,
          labelSize: parts.labelSize,
          labelColor: parts.labelColor,
          indication: parts.indication,
          leftHand: parts.leftHand,
          rightHand: parts.rightHand,
          lhRh: parts.lhRh,
          isActive: parts.isActive,
          createdAt: parts.createdAt,
          updatedAt: parts.updatedAt,
          customer: {
            id: customers.id,
            name: customers.name,
            alias: customers.alias,
          },
        })
        .from(parts)
        .leftJoin(customers, eq(parts.customerId, customers.id))
        .where(where)
        .limit(perPage)
        .offset(skip)
        .orderBy(sortOrder(sortColumn)),
      db.select({ count: count() }).from(parts).where(where),
    ]);

    const total = totalResult[0]?.count || 0;

    return c.json({
      result: partsData,
      pagination: {
        page,
        perPage,
        total,
        totalPages: Math.ceil(total / perPage),
      },
    });
  } catch (error) {
    console.error("Error fetching parts:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Get print history for a part - accessible by both admin and user roles
partsRoute.get(
  "/print-history/:partId",
  roleValidationMiddleware(["admin", "supervisor", "sales", "production"]),
  async (c) => {
    try {
      const partId = c.req.param("partId");
      const page = parseInt(c.req.query("page") || "1");
      const date = c.req.query("date");
      const perPage = parseInt(
        c.req.query("perPage") || c.req.query("limit") || "10",
      );
      const sortCol = c.req.query("sortCol") || "created_at";
      const sortDir = c.req.query("sortDir") || "DESC";

      const skip = (page - 1) * perPage;

      // Determine sort column and direction
      const sortColumnMap: Record<string, any> = {
        created_at: partsPrintHistory.createdAt,
        updated_at: partsPrintHistory.updatedAt,
      };

      let whereConditions = [eq(partsPrintHistory.partId, partId)];
      if (date) {
        const formattedDate = date.slice(0, 8);
        whereConditions.push(
          ilike(partsPrintHistory.serialEnd, `${formattedDate}%`),
        );
      }

      const sortColumn = sortColumnMap[sortCol] || partsPrintHistory.createdAt;
      const sortOrder = sortDir.toUpperCase() === "ASC" ? asc : desc;

      const where =
        whereConditions.length > 0 ? and(...whereConditions) : undefined;
      const [printHistoryData, totalResult] = await Promise.all([
        db
          .select({
            id: partsPrintHistory.id,
            partId: partsPrintHistory.partId,
            qtyLabel: partsPrintHistory.qtyLabel,
            qtyPart: partsPrintHistory.qtyPart,
            serialFrom: partsPrintHistory.serialFrom,
            serialEnd: partsPrintHistory.serialEnd,
            status: partsPrintHistory.status,
            createdAt: partsPrintHistory.createdAt,
            updatedAt: partsPrintHistory.updatedAt,
            part: {
              id: parts.id,
              name: parts.name,
              no: parts.no,
              colorCode: parts.colorCode,
              model: parts.model,
              qtyPerPack: parts.qtyPerPack,
              labelSize: parts.labelSize,
              indication: parts.indication,
              leftHand: parts.leftHand,
              rightHand: parts.rightHand,
              customer: {
                id: customers.id,
                name: customers.name,
                alias: customers.alias,
              } as any,
            },
          })
          .from(partsPrintHistory)
          .leftJoin(parts, eq(partsPrintHistory.partId, parts.id))
          .leftJoin(customers, eq(parts.customerId, customers.id))
          .where(where)
          .limit(perPage)
          .offset(skip)
          .orderBy(sortOrder(sortColumn)),
        db.select({ count: count() }).from(partsPrintHistory).where(where),
      ]);

      const total = totalResult[0]?.count || 0;

      return c.json({
        result: printHistoryData,
        pagination: {
          page,
          perPage,
          total,
          totalPages: Math.ceil(total / perPage),
        },
      });
    } catch (error) {
      console.error("Error fetching print history:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  },
);

// Export parts to Excel
partsRoute.get(
  "/export",
  roleValidationMiddleware(["admin", "supervisor", "sales", "production"]),
  async (c) => {
    try {
      const customerId = c.req.query("customerId");

      let whereConditions = [];
      if (customerId) {
        whereConditions.push(eq(parts.customerId, customerId));
      }

      // Add condition to exclude soft-deleted records
      whereConditions.push(isNull(parts.deletedAt));

      const where =
        whereConditions.length > 0 ? and(...whereConditions) : undefined;

      const partsData = await db
        .select({
          "Part Name": parts.name,
          "Part Number": parts.no,
          "Color Code": parts.colorCode,
          Customer: customers.name,
          Model: parts.model,
          "Qty / Pack": parts.qtyPerPack,
          "Label Color": parts.labelColor,
          Indication: parts.indication,
          "Left Hand": parts.leftHand,
          "Right Hand": parts.rightHand,
        })
        .from(parts)
        .leftJoin(customers, eq(parts.customerId, customers.id))
        .where(where)
        .orderBy(desc(parts.createdAt));

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(partsData);

      // Set column widths
      const columnWidths = [
        { wch: 20 }, // name
        { wch: 15 }, // no
        { wch: 15 }, // colorCode
        { wch: 20 }, // customerName
        { wch: 15 }, // model
        { wch: 15 }, // qtyPerPack
        { wch: 15 }, // labelSize
        { wch: 20 }, // indication
        { wch: 15 }, // leftHand
        { wch: 15 }, // rightHand
      ];
      worksheet["!cols"] = columnWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, "Parts Data");

      // Generate buffer
      const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

      // Set response headers
      c.header(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );
      c.header("Content-Disposition", "attachment; filename=parts_export.xlsx");

      return c.body(buffer);
    } catch (error) {
      console.error("Error exporting parts:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  },
);

// Create print history record - accessible by both admin and user roles
partsRoute.post(
  "/print-history",
  roleValidationMiddleware(["admin", "supervisor", "sales", "production"]),
  async (c) => {
    try {
      const body = await c.req.json();
      const data = printHistorySchema.parse(body);

      const userId = c.get("userId") as string;
      const userResult = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);
      const user = userResult[0];

      const [printHistory] = await db
        .insert(partsPrintHistory)
        .values({
          ...data,
          status: data.status.toString(),
          printBy: userId,
          printByName: user ? user.fullName : "Unknown",
        })
        .returning();

      return c.json(
        {
          message: "Print history recorded successfully",
          printHistory,
        },
        201,
      );
    } catch (error) {
      if (error instanceof z.ZodError) {
        return c.json({ error: error.message }, 400);
      }
      console.error("Error recording print history:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  },
);

// Get all print history with pagination and filtering - accessible by both admin and user roles
partsRoute.get(
  "/print-history",
  roleValidationMiddleware(["admin", "supervisor", "sales", "production"]),
  async (c) => {
    try {
      const page = parseInt(c.req.query("page") || "1");
      const perPage = parseInt(
        c.req.query("perPage") || c.req.query("limit") || "10",
      );
      const search = c.req.query("search");
      const sortCol = c.req.query("sortCol") || "created_at";
      const sortDir = c.req.query("sortDir") || "DESC";

      // Column-specific filters
      const filterCustomerId = c.req.query("filter_customerId");
      const filterPartId = c.req.query("filter_partId");
      const filterPartName = c.req.query("filter_part.name");
      const filterPartNo = c.req.query("filter_part.no");
      const filterPartColorCode = c.req.query("filter_part.colorCode");
      const filterPartModel = c.req.query("filter_part.model");
      const filterCustomerName = c.req.query("filter_part.customer.name");

      const skip = (page - 1) * perPage;

      let whereConditions = [];

      // General search across multiple columns
      if (search) {
        whereConditions.push(
          or(
            like(parts.name, `%${search}%`),
            like(parts.no, `%${search}%`),
            like(parts.colorCode, `%${search}%`),
            like(parts.model, `%${search}%`),
          ),
        );
      }

      // Column-specific filters
      if (filterCustomerId) {
        whereConditions.push(eq(parts.customerId, filterCustomerId));
      }

      if (filterPartId) {
        whereConditions.push(eq(partsPrintHistory.partId, filterPartId));
      }

      if (filterPartName) {
        whereConditions.push(ilike(parts.name, `%${filterPartName}%`));
      }

      if (filterPartNo) {
        whereConditions.push(ilike(parts.no, `%${filterPartNo}%`));
      }

      if (filterPartColorCode) {
        whereConditions.push(
          ilike(parts.colorCode, `%${filterPartColorCode}%`),
        );
      }

      if (filterPartModel) {
        whereConditions.push(ilike(parts.model, `%${filterPartModel}%`));
      }

      if (filterCustomerName) {
        whereConditions.push(ilike(customers.name, `%${filterCustomerName}%`));
      }

      const where =
        whereConditions.length > 0 ? and(...whereConditions) : undefined;

      // Determine sort column and direction
      const sortColumnMap: Record<string, any> = {
        created_at: partsPrintHistory.createdAt,
        updated_at: partsPrintHistory.updatedAt,
      };

      const sortColumn = sortColumnMap[sortCol] || partsPrintHistory.createdAt;
      const sortOrder = sortDir.toUpperCase() === "ASC" ? asc : desc;

      const [printHistoryData, totalResult] = await Promise.all([
        db
          .select({
            id: partsPrintHistory.id,
            partId: partsPrintHistory.partId,
            qtyLabel: partsPrintHistory.qtyLabel,
            qtyPart: partsPrintHistory.qtyPart,
            serialFrom: partsPrintHistory.serialFrom,
            serialEnd: partsPrintHistory.serialEnd,
            status: partsPrintHistory.status,
            productionDate: partsPrintHistory.productionDate,
            printBy: partsPrintHistory.printBy,
            printByName: partsPrintHistory.printByName,
            createdAt: partsPrintHistory.createdAt,
            updatedAt: partsPrintHistory.updatedAt,
            part: {
              id: parts.id,
              name: parts.name,
              no: parts.no,
              colorCode: parts.colorCode,
              model: parts.model,
              qtyPerPack: parts.qtyPerPack,
              labelSize: parts.labelSize,
              labelColor: parts.labelColor,
              indication: parts.indication,
              leftHand: parts.leftHand,
              rightHand: parts.rightHand,
              lhRh: parts.lhRh,
              customer: {
                id: customers.id,
                name: customers.name,
                alias: customers.alias,
              } as any,
            },
          })
          .from(partsPrintHistory)
          .leftJoin(parts, eq(partsPrintHistory.partId, parts.id))
          .leftJoin(customers, eq(parts.customerId, customers.id))
          .where(where)
          .limit(perPage)
          .offset(skip)
          .orderBy(sortOrder(sortColumn)),
        db
          .select({ count: count() })
          .from(partsPrintHistory)
          .leftJoin(parts, eq(partsPrintHistory.partId, parts.id))
          .where(where),
      ]);

      const total = totalResult[0]?.count || 0;

      return c.json({
        result: printHistoryData,
        pagination: {
          page,
          perPage,
          total,
          totalPages: Math.ceil(total / perPage),
        },
      });
    } catch (error) {
      console.error("Error fetching print history:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  },
);

// Get distinct label colors - accessible by both admin and user roles
partsRoute.get(
  "/label-colors",
  roleValidationMiddleware(["admin", "supervisor", "sales", "production"]),
  async (c) => {
    try {
      const distinctColors = await db
        .selectDistinct({ labelColor: parts.labelColor })
        .from(parts)
        .where(and(isNotNull(parts.labelColor), isNull(parts.deletedAt)))
        .orderBy(asc(parts.labelColor));

      const colors = distinctColors.map((item) => item.labelColor);

      return c.json({
        result: colors,
        count: colors.length,
      });
    } catch (error) {
      console.error("Error fetching distinct label colors:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  },
);

// Get part by ID - accessible by both admin and user roles
partsRoute.get(
  "/:id",
  roleValidationMiddleware(["admin", "supervisor", "sales", "production"]),
  async (c) => {
    try {
      const id = c.req.param("id");

      const partResult = await db
        .select({
          id: parts.id,
          name: parts.name,
          no: parts.no,
          colorCode: parts.colorCode,
          customerId: parts.customerId,
          model: parts.model,
          qtyPerPack: parts.qtyPerPack,
          labelSize: parts.labelSize,
          labelColor: parts.labelColor,
          indication: parts.indication,
          leftHand: parts.leftHand,
          rightHand: parts.rightHand,
          createdAt: parts.createdAt,
          updatedAt: parts.updatedAt,
          customer: {
            id: customers.id,
            name: customers.name,
            alias: customers.alias,
          },
        })
        .from(parts)
        .leftJoin(customers, eq(parts.customerId, customers.id))
        .where(and(eq(parts.id, id), isNull(parts.deletedAt)))
        .limit(1);

      const part = partResult[0];

      if (!part) {
        return c.json({ error: "Part not found" }, 404);
      }

      return c.json({ result: part });
    } catch (error) {
      console.error("Error fetching part:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  },
);

// Create part - only accessible by admin role
partsRoute.post(
  "/",
  roleValidationMiddleware(["admin", "supervisor", "sales", "production"]),
  async (c) => {
    try {
      const body = await c.req.json();
      const data = partSchema.parse(body);

      const [part] = await db.insert(parts).values(data).returning();

      return c.json(
        {
          message: "Part created successfully",
          part,
        },
        201,
      );
    } catch (error) {
      if (error instanceof z.ZodError) {
        return c.json({ error: error.message }, 400);
      }
      console.error("Error creating part:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  },
);

// Update part - only accessible by admin role
partsRoute.put(
  "/:id",
  roleValidationMiddleware(["admin", "supervisor", "sales", "production"]),
  async (c) => {
    try {
      const id = c.req.param("id");
      const body = await c.req.json();
      const data = partUpdateSchema.parse(body);

      const [part] = await db
        .update(parts)
        .set(data)
        .where(eq(parts.id, id))
        .returning();

      if (!part) {
        return c.json({ error: "Part not found" }, 404);
      }

      return c.json({
        message: "Part updated successfully",
        part,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return c.json({ error: error.message }, 400);
      }
      console.error("Error updating part:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  },
);

// Delete part - only accessible by admin role (soft delete)
partsRoute.delete(
  "/:id",
  roleValidationMiddleware(["admin", "supervisor", "sales", "production"]),
  async (c) => {
    try {
      const id = c.req.param("id");

      const [deletedPart] = await db
        .update(parts)
        .set({ deletedAt: new Date() })
        .where(eq(parts.id, id))
        .returning();

      if (!deletedPart) {
        return c.json({ error: "Part not found" }, 404);
      }

      return c.json({ message: "Part deleted successfully" });
    } catch (error) {
      console.error("Error deleting part:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  },
);

// Download Excel template
partsRoute.get(
  "/template/download",
  roleValidationMiddleware(["admin", "supervisor", "sales", "production"]),
  async (c) => {
    try {
      // Fetch all customers
      const customerData = await db
        .select({
          name: customers.name,
          alias: customers.alias,
          address: customers.address,
        })
        .from(customers)
        .where(isNull(customers.deletedAt))
        .orderBy(customers.name);

      // Transform customer data with Indonesian headers
      const customerSheetData = customerData.map((customer) => ({
        Nama: customer.name,
        Alias: customer.alias,
        Alamat: customer.address || "",
      }));

      // Create parts template data
      const templateData = [
        {
          "Part Name": "Example Part",
          "Part Number": "P001",
          "Color Code": "RED",
          Customer: "Example Customer",
          Model: "Model A",
          "Qty / Pack": 10,
          "Label Color": "White",
          Indication: "Sample indication",
          "Left Hand": "true",
          "Right Hand": "false",
        },
      ];

      // Create workbook and parts worksheet
      const workbook = XLSX.utils.book_new();
      const partsWorksheet = XLSX.utils.json_to_sheet(templateData);

      // Set column widths for parts worksheet
      const partsColumnWidths = [
        { wch: 20 }, // name
        { wch: 15 }, // no
        { wch: 15 }, // colorCode
        { wch: 20 }, // customerName
        { wch: 15 }, // model
        { wch: 15 }, // qtyPerPack
        { wch: 15 }, // labelColor
        { wch: 20 }, // indication
        { wch: 15 }, // leftHand
        { wch: 15 }, // rightHand
      ];
      partsWorksheet["!cols"] = partsColumnWidths;

      // Add parts worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, partsWorksheet, "Parts Template");

      // Create customer worksheet
      const customerWorksheet = XLSX.utils.json_to_sheet(customerSheetData);

      // Set column widths for customer worksheet
      const customerColumnWidths = [
        { wch: 25 }, // Nama
        { wch: 20 }, // Alias
        { wch: 40 }, // Alamat
      ];
      customerWorksheet["!cols"] = customerColumnWidths;

      // Add customer worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, customerWorksheet, "Customer");

      // Generate buffer
      const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

      // Set response headers
      c.header(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );
      c.header(
        "Content-Disposition",
        "attachment; filename=parts_template.xlsx",
      );

      return c.body(buffer);
    } catch (error) {
      console.error("Error generating template:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  },
);

// Import parts from Excel
partsRoute.post(
  "/import",
  roleValidationMiddleware(["admin", "supervisor", "sales", "production"]),
  async (c) => {
    try {
      const formData = await c.req.formData();
      const file = formData.get("file") as File;

      if (!file) {
        return c.json({ error: "No file uploaded" }, 400);
      }

      // Read file buffer
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "buffer" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      // Remove header rows (first row: db columns, second row: Indonesian headers)
      const [headers, ...rows] = jsonData;

      // Validate headers - check second row (Indonesian headers)
      // const expectedHeadersIndonesian = [
      //   "Nama Part", "Nomor Part", "Kode Warna", "Nama Pelanggan", "Model",
      //   "Kuantitas Per Pack", "Ukuran Label", "Indikasi", "Tangan Kiri", "Tangan Kanan"
      // ];

      console.log({ rows });

      const expectedheaders = [
        "Part Name",
        "Part Number",
        "Color Code",
        "Customer",
        "Model",
        "Qty / Pack",
        "Label Color",
        "Indication",
        "Left Hand",
        "Right Hand",
      ];

      const isValidHeaders =
        headers &&
        Array.isArray(headers) &&
        expectedheaders.every((header) => headers.includes(header));

      if (!isValidHeaders) {
        return c.json(
          {
            error: "Invalid Excel format. Please use the provided template.",
          },
          400,
        );
      }

      // Process rows
      const results = {
        success: 0,
        errors: [] as string[],
        imported: [] as any[],
      };

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i] as any[];
        if (!row || row.every((cell) => !cell)) continue; // Skip empty rows

        try {
          // Create object from row data
          const rowData = {
            name: row[0]?.toString() || "",
            no: row[1]?.toString() || "",
            colorCode: row[2]?.toString() || "",
            customerName: row[3]?.toString()?.toLowerCase() || "",
            model: row[4]?.toString() || "",
            qtyPerPack: parseInt(row[5]?.toString() || "0") || 0,
            labelColor: row[6]?.toString() || "",
            indication: row[7]?.toString() || "",
            leftHand: row[8]?.toString()?.toLowerCase() === "true",
            rightHand: row[9]?.toString()?.toLowerCase() === "true",
          };

          // Validate data
          const validatedData = partImportSchema.parse(rowData);

          // Find customer by name
          const customerResult = await db
            .select()
            .from(customers)
            .where(
              or(
                eq(lower(customers.name), validatedData.customerName),
                eq(lower(customers.alias), validatedData.customerName),
              ),
            )
            .limit(1);

          if (customerResult.length === 0) {
            results.errors.push(
              `Row ${i + 3}: Customer "${validatedData.customerName}" not found`,
            );
            continue;
          }

          const customerId = customerResult[0].id;

          // Check if part already exists (excluding soft-deleted)
          const existingPart = await db
            .select()
            .from(parts)
            .where(and(eq(parts.no, validatedData.no), isNull(parts.deletedAt)))
            .limit(1);

          if (existingPart.length > 0) {
            results.errors.push(
              `Row ${i + 3}: Part with number "${validatedData.no}" already exists`,
            );
            continue;
          }

          // Insert part
          const [newPart] = await db
            .insert(parts)
            .values({
              name: validatedData.name,
              no: validatedData.no,
              colorCode: validatedData.colorCode,
              customerId: customerId,
              model: validatedData.model,
              qtyPerPack: validatedData.qtyPerPack,
              labelColor: validatedData.labelColor,
              indication: validatedData.indication,
              leftHand: validatedData.leftHand,
              rightHand: validatedData.rightHand,
            })
            .returning();

          results.success++;
          results.imported.push(newPart);
        } catch (error) {
          if (error instanceof z.ZodError) {
            results.errors.push(
              `Row ${i + 3}: ${error.issues.map((e: any) => e.message).join(", ")}`,
            );
          } else {
            results.errors.push(`Row ${i + 3}: Unexpected error`);
          }
        }
      }

      return c.json({
        message: `Import completed. ${results.success} parts imported successfully.`,
        results,
      });
    } catch (error) {
      console.error("Error importing parts:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  },
);

export { partsRoute as parts };
