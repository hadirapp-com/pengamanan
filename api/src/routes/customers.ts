import { Hono } from "hono";
import { z } from "zod";
import { db } from "../lib/db";
import { customers, deliveries } from "../lib/schema";
import { eq, desc, like, or, count, and, isNull } from "drizzle-orm";
import { authMiddleware, roleValidationMiddleware } from "../middleware/auth";
import { customerSchema } from "../schemas";

const customersRoute = new Hono();

// Apply auth middleware to all routes
customersRoute.use("*", authMiddleware);

// Get all customers - accessible by both admin and user roles
customersRoute.get("/", roleValidationMiddleware(["*"]), async (c) => {
  try {
    const page = parseInt(c.req.query("page") || "1");
    const limit = parseInt(c.req.query("limit") || "10");
    const search = c.req.query("search");

    const skip = (page - 1) * limit;

    let whereConditions = [];
    
    if (search) {
      whereConditions.push(
        or(
          like(customers.name, `%${search}%`),
          like(customers.alias, `%${search}%`)
        )
      );
    }

    // Add condition to exclude soft-deleted records
    whereConditions.push(isNull(customers.deletedAt));

    const where = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const [customersData, totalResult] = await Promise.all([
      db.select().from(customers)
        .where(where)
        .limit(limit)
        .offset(skip)
        .orderBy(desc(customers.createdAt)),
      db.select({ count: count() }).from(customers).where(where),
    ]);

    const total = totalResult[0]?.count || 0;

    return c.json({
      result: customersData,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Get customer by ID - accessible by both admin and user roles
customersRoute.get("/:id", roleValidationMiddleware(["admin", "user"]), async (c) => {
  try {
    const id = c.req.param("id");

    const customerResult = await db.select().from(customers).where(and(eq(customers.id, id), isNull(customers.deletedAt))).limit(1);
    const customer = customerResult[0];

    if (!customer) {
      return c.json({ error: "Customer not found" }, 404);
    }

    // Get recent deliveries for this customer
    const customerDeliveries = await db.select().from(deliveries)
      .where(eq(deliveries.customerId, id))
      .orderBy(desc(deliveries.createdAt))
      .limit(10);

    const customerWithDeliveries = {
      ...customer,
      deliveries: customerDeliveries,
    };

    return c.json({ result: customerWithDeliveries });
  } catch (error) {
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Create customer - only accessible by admin role
customersRoute.post("/", roleValidationMiddleware(["admin"]), async (c) => {
  try {
    const body = await c.req.json();
    const data = customerSchema.parse(body);

    const [customer] = await db.insert(customers).values(data).returning();

    return c.json(
      {
        message: "Customer created successfully",
        customer,
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

// Update customer - only accessible by admin role
customersRoute.put("/:id", roleValidationMiddleware(["admin"]), async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const data = customerSchema.parse(body);

    const [customer] = await db.update(customers).set(data).where(eq(customers.id, id)).returning();

    return c.json({
      message: "Customer updated successfully",
      customer,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: error.message }, 400);
    }
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Delete customer - only accessible by admin role (soft delete)
customersRoute.delete("/:id", roleValidationMiddleware(["admin"]), async (c) => {
  try {
    const id = c.req.param("id");

    const [deletedCustomer] = await db.update(customers)
      .set({ deletedAt: new Date() })
      .where(eq(customers.id, id))
      .returning();

    if (!deletedCustomer) {
      return c.json({ error: "Customer not found" }, 404);
    }

    return c.json({ message: "Customer deleted successfully" });
  } catch (error) {
    return c.json({ error: "Internal server error" }, 500);
  }
});

export { customersRoute as customers };
