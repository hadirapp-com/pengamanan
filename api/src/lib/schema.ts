import {
  text,
  timestamp,
  varchar,
  index,
  pgSchema,
  boolean,
  integer,
  jsonb,
  AnyPgColumn,
  date,
} from "drizzle-orm/pg-core";
import { relations, SQL, sql } from "drizzle-orm";

export const pokayokeSchema = pgSchema("pokayoke");

// Users table
export const users = pokayokeSchema.table("users", {
  id: varchar("id", { length: 100 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
  role: text("role").notNull(),
  email: text("email").unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  emailVerificationToken: text("email_verification_token"),
  resetPasswordToken: text("reset_password_token"),
  resetPasswordExpires: timestamp("reset_password_expires"),
  fullName: text("full_name"),
  nik: text("nik"),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Master parts
export const parts = pokayokeSchema.table("parts", {
  id: varchar("id", { length: 100 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 255 }).notNull(),
  no: varchar("no", { length: 255 }).notNull(),
  colorCode: varchar("color_code", { length: 255 }),
  customerId: varchar("customer_id", { length: 255 }).notNull(),
  model: varchar("model", { length: 255 }),
  qtyPerPack: integer("qty_per_pack").notNull(),
  labelSize: varchar("label_size", { length: 255 }),
  indication: varchar("indication", { length: 255 }),
  leftHand: boolean("left_hand"),
  rightHand: boolean("right_hand"),
  lhRh: boolean("lh_rh"),
  labelColor: varchar("label_color", { length: 255 }).default('White'),
  isActive: boolean("is_active").default(true),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Print History table
export const partsPrintHistory = pokayokeSchema.table("parts_print_history", {
  id: varchar("id", { length: 100 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  partId: varchar("part_id", { length: 255 }).notNull(),
  productionDate: date("production_date"),
  qtyLabel: integer("qty_label").notNull(),
  qtyPart: integer("qty_part").notNull(),
  serialFrom: varchar("serial_from", { length: 255 }),
  serialEnd: varchar("serial_end", { length: 255 }),
  status: varchar("status", { length: 255 }).notNull().default("1"), // Print status (1st print, 2nd print, etc.)
  printBy: varchar("print_by", { length: 255 }),
  printByName: varchar("print_by_name", { length: 255 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Customers table
export const customers = pokayokeSchema.table("customers", {
  id: varchar("id", { length: 100 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 255 }).notNull(),
  address: text("address"),
  alias: varchar("alias", { length: 255 }).notNull(),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Deliveries table
// lt1 = preparation
// lt2 delivery
export const deliveries = pokayokeSchema.table(
  "deliveries",
  {
    id: varchar("id", { length: 100 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    customerId: varchar("customer_id", { length: 255 }).notNull(),
    orderNo: varchar("order_no", { length: 255 }).notNull(),
    file: varchar("file", { length: 255 }).notNull(),
    partNumberRaw: varchar("part_number_raw", { length: 255 }).notNull(),
    partNumber: varchar("part_number", { length: 255 }).notNull(),
    partName: varchar("part_name", { length: 255 }).notNull(),
    colorCode: varchar("color_code", { length: 255 }).notNull(),
    seqProd: varchar("seq_prod", { length: 255 }).notNull(),
    kdLotNo: varchar("kd_lot_no", { length: 255 }).notNull(),
    qty: varchar("qty", { length: 255 }).notNull(),
    date: varchar("date", { length: 255 }).notNull(),
    time: varchar("time", { length: 255 }).notNull(),
    adjustDate: varchar("adjust_date", { length: 255 }),
    adjustTime: varchar("adjust_time", { length: 255 }),
    slipNumber: varchar("slip_number", { length: 255 }).notNull(),
    remarksBawah: varchar("remarks_bawah", { length: 255 }).notNull(),
    barcodeHpm: varchar("barcode_hpm", { length: 255 }).notNull(),
    barcodeKasaiRaw: varchar("barcode_kasai_raw", { length: 255 }).notNull(),
    barcodeKasai: varchar("barcode_kasai", { length: 255 }).notNull(),
    scanLt1By: varchar("scan_lt1_by", { length: 255 }),
    scanLt1ByName: varchar("scan_lt1_by_name", { length: 255 }),
    scanLt1At: timestamp("scan_lt1_at"),
    scanLt2By: varchar("scan_lt2_by", { length: 255 }),
    scanLt2ByName: varchar("scan_lt2_by_name", { length: 255 }),
    scanLt2At: timestamp("scan_lt2_at"),
    scanLt1Qr: varchar("scan_lt1_qr", { length: 255 }),
    scanLt2Qr: varchar("scan_lt2_qr", { length: 255 }),
    poNumber: varchar("po_number", { length: 255 }),
    preparationUniqueBarcode: varchar("preparation_unique_barcode", { length: 255 }),
    deliveryUniqueBarcode: varchar("delivery_unique_barcode", { length: 255 }),
    partNumberKasai: varchar("part_number_kasai", { length: 255 }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    deliveryYear: integer("delivery_year").default(new Date().getFullYear()),
  },
  (table) => ({
    customerIdIdx: index("customer_id_idx").on(table.customerId),
    dateIdx: index("date_idx").on(table.date),
    timeIdx: index("time_idx").on(table.time),
    adjustDateIdx: index("adjust_date_idx").on(table.adjustDate),
    adjustTimeIdx: index("adjust_time_idx").on(table.adjustTime),
    barcodeHpmIdx: index("barcode_hpm_idx").on(table.barcodeHpm),
    barcodeKasaiIdx: index("barcode_kasai_idx").on(table.barcodeKasai),
    slipNumberIdx: index("slip_number_idx").on(table.slipNumber),
    deliveryYearIdx: index("delivery_year_idx").on(table.deliveryYear),
    poNumber: index("po_number_idx").on(table.poNumber),
    scanLt1ByIdx: index("scan_lt1_by_idx").on(table.scanLt1By),
    scanLt2ByIdx: index("scan_lt2_by_idx").on(table.scanLt2By),
    scanLt1AtIdx: index("scan_lt1_at_idx").on(table.scanLt1At),
    scanLt2AtIdx: index("scan_lt2_at_idx").on(table.scanLt2At),
    scanLt1QrIdx: index("scan_lt1_qr_idx").on(table.scanLt1Qr),
    scanLt2QrIdx: index("scan_lt2_qr_idx").on(table.scanLt2Qr),
  }),
);

// Menus table
export const menus = pokayokeSchema.table(
  "menus",
  {
    id: varchar("id", { length: 100 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: varchar("name", { length: 255 }).notNull(),
    href: varchar("href", { length: 255 }).notNull(),
    icon: varchar("icon", { length: 255 }),
    hasChildren: text("has_children").notNull().default("false"),
    parentId: text("parent_id"),
    order: text("order").notNull().default("0"),
    isActive: text("is_active").notNull().default("true"),
    allowedRoles: text("allowed_roles").notNull().default("admin,user"), // comma-separated roles
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    parentIdIdx: index("parent_id_idx").on(table.parentId),
    orderIdx: index("order_idx").on(table.order),
    isActiveIdx: index("is_active_idx").on(table.isActive),
  }),
);

// Relations
export const usersRelations = relations(users, () => ({}));

export const customersRelations = relations(customers, ({ many }) => ({
  deliveries: many(deliveries),
  parts: many(parts),
  scanLogs: many(scanLogs),
}));

export const deliveriesRelations = relations(deliveries, ({ one }) => ({
  customer: one(customers, {
    fields: [deliveries.customerId],
    references: [customers.id],
  }),
}));

export const menusRelations = relations(menus, ({ many, one }) => ({
  children: many(menus, { relationName: "parent_child" }),
  parent: one(menus, {
    fields: [menus.parentId],
    references: [menus.id],
    relationName: "parent_child",
  }),
}));

export const partsRelations = relations(parts, ({ one, many }) => ({
  customer: one(customers, {
    fields: [parts.customerId],
    references: [customers.id],
  }),
  printHistory: many(partsPrintHistory, {
    relationName: "parts_print_history",
  }),
}));

export const partsPrintHistoryRelations = relations(
  partsPrintHistory,
  ({ one }) => ({
    part: one(parts, {
      fields: [partsPrintHistory.partId],
      references: [parts.id],
    }),
  }),
);

// Scan Log table - Enhanced to support detailed event tracking from mobile
export const scanLogs = pokayokeSchema.table(
  "scan_logs",
  {
    id: varchar("id", { length: 100 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    customerId: varchar("customer_id", { length: 255 }).notNull(),
    customer: varchar("customer", { length: 255 }).notNull(),
    deliveryId: varchar("delivery_id", { length: 255 }), // Optional: relates to deliveries table
    partNumber: varchar("part_number", { length: 255 }),
    partName: varchar("part_name", { length: 255 }),
    colorCode: varchar("color_code", { length: 255 }),
    lot: varchar("lot", { length: 255 }).notNull(),
    deliveryYear: varchar("delivery_year", { length: 10 }),
    scanBy: varchar("scan_by", { length: 255 }).notNull(),
    scanType: varchar("scan_type", {
      length: 50,
      enum: ["preparation", "delivery"],
    }).notNull(),
    kasaiBarcode: varchar("kasai_barcode", { length: 255 }),
    customerBarcode: varchar("customer_barcode", { length: 255 }),
    firstScan: varchar("first_scan", { length: 255 }),
    secondScan: varchar("second_scan", { length: 255 }),
    scanStatus: varchar("scan_status", {
      length: 50,
      enum: ["match", "missmatch", "double scan", "not found"],
    }),
    // New fields for detailed event tracking (from local_scan_logs)
    deviceId: varchar("device_id", { length: 255 }), // Device that performed the scan
    userId: varchar("user_id", { length: 255 }), // User who initiated the scan session
    sessionStatus: varchar("session_status", {
      length: 50,
      enum: ["pending", "success", "failed"],
    }), // Status of the scan session
    startTime: timestamp("start_time"), // Session start time
    endTime: timestamp("end_time"), // Session end time
    events: jsonb("events"), // Array of detailed scan events for debugging
    syncedAt: timestamp("synced_at"), // When mobile log was synced to server
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    customerIdIdx: index("scan_log_customer_id_idx").on(table.customerId),
    deliveryIdIdx: index("scan_log_delivery_id_idx").on(table.deliveryId),
    lotIdx: index("scan_log_lot_idx").on(table.lot),
    scanByIdx: index("scan_log_scan_by_idx").on(table.scanBy),
    scanTypeIdx: index("scan_log_type_idx").on(table.scanType),
    scanStatusIdx: index("scan_log_status_idx").on(table.scanStatus),
    createdAtIdx: index("scan_log_created_at_idx").on(table.createdAt),
    deliveryYearIdx: index("scan_log_delivery_year_idx").on(table.deliveryYear),
    // New indexes for detailed event tracking
    deviceIdIdx: index("scan_log_device_id_idx").on(table.deviceId),
    userIdIdx: index("scan_log_user_id_idx").on(table.userId),
    sessionStatusIdx: index("scan_log_session_status_idx").on(table.sessionStatus),
    syncedAtIdx: index("scan_log_synced_at_idx").on(table.syncedAt),
  }),
);

// Relations
export const scanLogsRelations = relations(scanLogs, ({ one }) => ({
  customer: one(customers, {
    fields: [scanLogs.customerId],
    references: [customers.id],
  }),
  delivery: one(deliveries, {
    fields: [scanLogs.deliveryId],
    references: [deliveries.id],
  }),
  scanner: one(users, {
    fields: [scanLogs.scanBy],
    references: [users.id],
  }),
}));

export const scanLotStatus = pokayokeSchema.table(
  "scan_lot_status",
  {
    id: varchar("id", { length: 100 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    kdLotNo: varchar("kd_lot_no", { length: 255 }),
    customerId: varchar("customer_id", { length: 255 }),
    preparationStatus: varchar("preparation_status", {
      length: 255,
      enum: ["open", "in progress", "closed"],
    }),
    deliveryStatus: varchar("delivery_status", {
      length: 255,
      enum: ["open", "in progress", "closed"],
    }),
    preparationBy: varchar("preparation_by", { length: 255 }),
    preparationStartedAt: timestamp("preparation_started_at"),
    preparationCompletedAt: timestamp("preparation_completed_at"),
    preparationBypassedAt: timestamp("preparation_bypassed_at"),
    preparationBypassedBy: varchar("preparation_bypassed_by", { length: 255 }),
    preparationBypassedReason: text("preparation_bypassed_reason"),
    deliveryBy: varchar("delivery_by", { length: 255 }),
    deliveryStartedAt: timestamp("delivery_started_at"),
    deliveryCompletedAt: timestamp("delivery_completed_at"),
    deliveryBypassedAt: timestamp("delivery_bypassed_at"),
    deliveryBypassedBy: varchar("delivery_bypassed_by", { length: 255 }),
    kdLotNoTo: varchar("kd_lot_no_to", { length: 255 }),
    poNumber: varchar("po_number", { length: 255 }),
    addColumn: varchar("add_column", { length: 255 }),
    deliveryBypassedReason: text("delivery_bypassed_reason"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    kdLotNoIdx: index("lot_status_kd_lot_no_idx").on(table.kdLotNo),
    customerIdIdx: index("lot_status_customer_id_idx").on(table.customerId),
    preparationStatusIdx: index("lot_status_preparation_status_idx").on(
      table.preparationStatus,
    ),
    deliveryStatusIdx: index("lot_status_delivery_status_idx").on(
      table.deliveryStatus,
    ),
  }),
);

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Customer = typeof customers.$inferSelect;
export type NewCustomer = typeof customers.$inferInsert;
export type Delivery = typeof deliveries.$inferSelect;
export type NewDelivery = typeof deliveries.$inferInsert;
export type Menu = typeof menus.$inferSelect;
export type NewMenu = typeof menus.$inferInsert;
export type ScanLog = typeof scanLogs.$inferSelect;
export type NewScanLog = typeof scanLogs.$inferInsert;
export type ScanLotStatus = typeof scanLotStatus.$inferSelect;
export type Config = typeof configs.$inferSelect;
export type NewConfig = typeof configs.$inferInsert;

// Config table - key-value storage with JSON support
export const configs = pokayokeSchema.table(
  "configs",
  {
    id: varchar("id", { length: 100 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    key: varchar("key", { length: 255 }).unique().notNull(),
    value: jsonb("value").notNull(),
    description: text("description"),
    allow_delete: boolean("allow_delete").default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    keyIdx: index("config_key_idx").on(table.key),
  }),
);

export const configsRelations = relations(configs, () => ({}));

// custom lower function
export function lower(email: AnyPgColumn): SQL {
  return sql`lower(${email})`;
}
