import { Hono } from "hono";
import { z } from "zod";
import { db } from "../lib/db";
import { menus } from "../lib/schema";
import { eq, desc, like, or, count, and, ne, isNull } from "drizzle-orm";
import { authMiddleware, roleValidationMiddleware } from "../middleware/auth";
import { menuSchema, menuUpdateSchema } from "../schemas";

const menusRoute = new Hono();

// Apply auth middleware to all routes
menusRoute.use("*", authMiddleware);

// Get all menus - accessible by both admin and user roles
menusRoute.get("/", roleValidationMiddleware(["admin", "user"]), async (c) => {
  try {
    const page = parseInt(c.req.query("page") || "1");
    const limit = parseInt(c.req.query("limit") || "10");
    const search = c.req.query("search");
    const role = c.get("userRole");

    const skip = (page - 1) * limit;

    const where = search
      ? or(
        like(menus.name, `%${search}%`),
        like(menus.href, `%${search}%`)
      )
      : undefined;

    // Get all menus first to filter by role
    const allMenus = await db.select({
      id: menus.id,
      name: menus.name,
      href: menus.href,
      icon: menus.icon,
      hasChildren: menus.hasChildren,
      parentId: menus.parentId,
      order: menus.order,
      isActive: menus.isActive,
      allowedRoles: menus.allowedRoles,
      createdAt: menus.createdAt,
      updatedAt: menus.updatedAt,
    })
      .from(menus)
      .where(and(where, eq(menus.isActive, "true")))
      .orderBy(desc(menus.createdAt));

    // Filter menus by user role
    const filteredMenus = allMenus.filter(menu => {
      const allowedRoles = menu.allowedRoles.split(',');
      return allowedRoles.includes(role);
    });

    // Apply pagination to filtered results
    const total = filteredMenus.length;
    const paginatedMenus = filteredMenus.slice(skip, skip + limit);

    return c.json({
      result: paginatedMenus,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching menus:", error);
    return c.json({ message: "Internal server error" }, 500);
  }
});

// Get menu by ID - accessible by both admin and user roles
menusRoute.get("/:id", roleValidationMiddleware(["admin", "user"]), async (c) => {
  try {
    const id = c.req.param("id");
    const role = c.get("userRole");

    const menuResult = await db.select({
      id: menus.id,
      name: menus.name,
      href: menus.href,
      icon: menus.icon,
      hasChildren: menus.hasChildren,
      parentId: menus.parentId,
      order: menus.order,
      isActive: menus.isActive,
      allowedRoles: menus.allowedRoles,
      createdAt: menus.createdAt,
      updatedAt: menus.updatedAt,
    })
      .from(menus)
      .where(eq(menus.id, id))
      .limit(1);

    const menu = menuResult[0];

    if (!menu) {
      return c.json({ error: "Menu not found" }, 404);
    }

    // Check if user has access to this menu
    const allowedRoles = menu.allowedRoles.split(',');
    if (!allowedRoles.includes(role)) {
      return c.json({ error: "Access denied" }, 403);
    }

    return c.json({ result: menu });
  } catch (error) {
    return c.json({ message: "Internal server error" }, 500);
  }
});

// Get menus by role - accessible by both admin and user roles
menusRoute.get("/by-role/:role", roleValidationMiddleware(["admin", "user"]), async (c) => {
  try {
    const requestedRole = c.req.param("role");
    const userRole = c.get("userRole");

    // Only admins can request menus for other roles
    if (requestedRole !== userRole && userRole !== "admin") {
      return c.json({ error: "Access denied" }, 403);
    }

    const allMenus = await db.select({
      id: menus.id,
      name: menus.name,
      href: menus.href,
      icon: menus.icon,
      hasChildren: menus.hasChildren,
      parentId: menus.parentId,
      order: menus.order,
      isActive: menus.isActive,
      allowedRoles: menus.allowedRoles,
      createdAt: menus.createdAt,
      updatedAt: menus.updatedAt,
    })
      .from(menus)
      .where(eq(menus.isActive, "true"))
      .orderBy(menus.order);

    // Filter menus by requested role
    const filteredMenus = allMenus.filter(menu => {
      const allowedRoles = menu.allowedRoles.split(',');
      return allowedRoles.includes(requestedRole);
    });

    // Build hierarchical menu structure
    const buildMenuTree = (parentId: string | null = null) => {
      return filteredMenus
        .filter(menu => menu.parentId === parentId)
        .map(menu => ({
          ...menu,
          children: buildMenuTree(menu.id)
        }))
        .sort((a, b) => parseInt(a.order) - parseInt(b.order));
    };

    const menuTree = buildMenuTree();

    return c.json({ result: menuTree });
  } catch (error) {
    console.error("Error fetching menus by role:", error);
    return c.json({ message: "Internal server error" }, 500);
  }
});

// Create menu - only accessible by admin role
menusRoute.post("/", roleValidationMiddleware(["admin"]), async (c) => {
  try {
    const body = await c.req.json();
    const data = menuSchema.parse(body);

    // Convert boolean values to string for database storage
    const menuData = {
      ...data,
      hasChildren: data.hasChildren.toString(),
      isActive: data.isActive.toString(),
      order: data.order.toString(),
    };

    const [menu] = await db.insert(menus).values(menuData).returning({
      id: menus.id,
      name: menus.name,
      href: menus.href,
      icon: menus.icon,
      hasChildren: menus.hasChildren,
      parentId: menus.parentId,
      order: menus.order,
      isActive: menus.isActive,
      allowedRoles: menus.allowedRoles,
      createdAt: menus.createdAt,
      updatedAt: menus.updatedAt,
    });

    return c.json(
      {
        message: "Menu created successfully",
        menu,
      },
      201
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json(
        { message: "validation_error", error: JSON.parse(error.message) },
        400
      );
    }
    return c.json({ message: "Internal server error" }, 500);
  }
});

// Update menu - only accessible by admin role
menusRoute.put("/:id", roleValidationMiddleware(["admin"]), async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const data = menuUpdateSchema.parse(body);

    // Convert boolean values to string for database storage
    const updateData: any = { ...data };
    if (data.hasChildren !== undefined) {
      updateData.hasChildren = data.hasChildren.toString();
    }
    if (data.isActive !== undefined) {
      updateData.isActive = data.isActive.toString();
    }
    if (data.order !== undefined) {
      updateData.order = data.order.toString();
    }

    const [menu] = await db.update(menus).set(updateData).where(eq(menus.id, id)).returning({
      id: menus.id,
      name: menus.name,
      href: menus.href,
      icon: menus.icon,
      hasChildren: menus.hasChildren,
      parentId: menus.parentId,
      order: menus.order,
      isActive: menus.isActive,
      allowedRoles: menus.allowedRoles,
      createdAt: menus.createdAt,
      updatedAt: menus.updatedAt,
    });

    return c.json({
      message: "Menu updated successfully",
      menu,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ message: error.message }, 400);
    }
    return c.json({ message: "Internal server error" }, 500);
  }
});

// Delete menu - only accessible by admin role
menusRoute.delete("/:id", roleValidationMiddleware(["admin"]), async (c) => {
  try {
    const id = c.req.param("id");

    // Check if menu has children
    const childrenCount = await db.select({ count: count() })
      .from(menus)
      .where(eq(menus.parentId, id));

    if (childrenCount[0]?.count > 0) {
      return c.json({ error: "Cannot delete menu with children. Please delete children first." }, 400);
    }

    await db.delete(menus).where(eq(menus.id, id));

    return c.json({ message: "Menu deleted successfully" });
  } catch (error) {
    return c.json({ message: "Internal server error" }, 500);
  }
});

export { menusRoute as menus }; 