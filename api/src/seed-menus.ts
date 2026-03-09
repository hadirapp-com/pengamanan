import { db } from "./lib/db";
import { menus } from "./lib/schema";
import { eq } from "drizzle-orm";

const defaultMenus = [
  // Dashboard - accessible by both admin and user
  {
    name: "Dashboard",
    href: "/app",
    icon: "BarChart3",
    hasChildren: "false",
    parentId: null,
    order: "0",
    isActive: "true",
    allowedRoles: "admin,user",
  },
  // User Management - admin only
  {
    name: "User Management",
    href: "/app/users",
    icon: "Users",
    hasChildren: "false",
    parentId: null,
    order: "1",
    isActive: "true",
    allowedRoles: "admin",
  },
  // Customer Management - admin only
  {
    name: "Customer Management",
    href: "/app/customers",
    icon: "Building2",
    hasChildren: "false",
    parentId: null,
    order: "2",
    isActive: "true",
    allowedRoles: "admin",
  },
  // Delivery Management - both admin and user
  {
    name: "Delivery Management",
    href: "/app/deliveries",
    icon: "Truck",
    hasChildren: "false",
    parentId: null,
    order: "3",
    isActive: "true",
    allowedRoles: "admin,user",
  },
  // Menu Management - admin only
  {
    name: "Menu Management",
    href: "/app/menus",
    icon: "Menu",
    hasChildren: "false",
    parentId: null,
    order: "4",
    isActive: "true",
    allowedRoles: "admin",
  },
  // Reports - admin only
  {
    name: "Reports",
    href: "/app/reports",
    icon: "FileText",
    hasChildren: "true",
    parentId: null,
    order: "5",
    isActive: "true",
    allowedRoles: "admin",
  },
  // Delivery Reports - child of Reports
  {
    name: "Delivery Reports",
    href: "/app/reports/deliveries",
    icon: "FileBarChart",
    hasChildren: "false",
    parentId: null, // Will be set after parent is created
    order: "0",
    isActive: "true",
    allowedRoles: "admin",
  },
  // Customer Reports - child of Reports
  {
    name: "Customer Reports",
    href: "/app/reports/customers",
    icon: "Building",
    hasChildren: "false",
    parentId: null, // Will be set after parent is created
    order: "1",
    isActive: "true",
    allowedRoles: "admin",
  },
  // Settings - admin only
  {
    name: "Settings",
    href: "/app/settings",
    icon: "Settings",
    hasChildren: "false",
    parentId: null,
    order: "6",
    isActive: "true",
    allowedRoles: "admin",
  },
];

async function seedMenus() {
  try {
    console.log("🌱 Seeding menus...");

    // Insert main menus first
    const insertedMenus = [];
    for (const menu of defaultMenus) {
      const [insertedMenu] = await db.insert(menus).values(menu).returning();
      insertedMenus.push(insertedMenu);
      console.log(`✅ Created menu: ${menu.name}`);
    }

    // Update parent-child relationships for Reports submenus
    const reportsMenu = insertedMenus.find(menu => menu.name === "Reports");
    if (reportsMenu) {
      // Update Delivery Reports
      await db.update(menus)
        .set({ parentId: reportsMenu.id })
        .where(eq(menus.name, "Delivery Reports"));
      
      // Update Customer Reports
      await db.update(menus)
        .set({ parentId: reportsMenu.id })
        .where(eq(menus.name, "Customer Reports"));
      
      console.log("✅ Updated Reports submenu relationships");
    }

    console.log("🎉 Menu seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding menus:", error);
  }
}

// Run the seed function if this file is executed directly
if (import.meta.main) {
  seedMenus();
}

export { seedMenus }; 