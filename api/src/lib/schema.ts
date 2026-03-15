import {
  text,
  timestamp,
  varchar,
  index,
  pgSchema,
  boolean,
  date,
  uuid,
  integer,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const pengamananSchema = pgSchema("pengamanan");

// ============================================================================
// CONFIGS TABLE
// ============================================================================
export const configs = pengamananSchema.table(
  "configs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    key: varchar("key", { length: 100 }).unique().notNull(),
    value: text("value").notNull(),
    description: text("description"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    createdBy: uuid("created_by").references(() => users.id),
    updatedBy: uuid("updated_by").references(() => users.id),
  },
  (table) => ({
    keyIdx: index("configs_key_idx").on(table.key),
    isActiveIdx: index("configs_is_active_idx").on(table.isActive),
  }),
);

// ============================================================================
// USERS TABLE
// ============================================================================
export const users = pengamananSchema.table(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    username: varchar("username", { length: 100 }).unique().notNull(),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    role: varchar("role", { length: 20 })
      .$type<"superadmin" | "admin">()
      .notNull(),
    fullName: varchar("full_name", { length: 255 }),
    address: text("address"),
    phone: varchar("phone", { length: 20 }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    deletedAt: timestamp("deleted_at"),
    createdBy: uuid("created_by").references(() => users.id),
    updatedBy: uuid("updated_by").references(() => users.id),
  },
  (table) => ({
    usernameIdx: index("users_username_idx").on(table.username),
    roleIdx: index("users_role_idx").on(table.role),
    deletedAtIdx: index("users_deleted_at_idx").on(table.deletedAt),
  }),
);

// ============================================================================
// PETUGAS JAGA TABLE
// ============================================================================
export const petugasJaga = pengamananSchema.table(
  "petugas_jaga",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    nama: varchar("nama", { length: 255 }).notNull(),
    nik: varchar("nik", { length: 20 }),
    noHp: varchar("no_hp", { length: 20 }),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    deletedAt: timestamp("deleted_at"),
    createdBy: uuid("created_by").references(() => users.id),
    updatedBy: uuid("updated_by").references(() => users.id),
  },
  (table) => ({
    namaIdx: index("petugas_jaga_nama_idx").on(table.nama),
    isActiveIdx: index("petugas_jaga_is_active_idx").on(table.isActive),
    deletedAtIdx: index("petugas_jaga_deleted_at_idx").on(table.deletedAt),
  }),
);

// ============================================================================
// POS JAGA TABLE
// ============================================================================
export const posJaga = pengamananSchema.table(
  "pos_jaga",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    nama: varchar("nama", { length: 255 }).notNull(),
    lokasi: text("lokasi"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    deletedAt: timestamp("deleted_at"),
    createdBy: uuid("created_by").references(() => users.id),
    updatedBy: uuid("updated_by").references(() => users.id),
  },
  (table) => ({
    namaIdx: index("pos_jaga_nama_idx").on(table.nama),
    isActiveIdx: index("pos_jaga_is_active_idx").on(table.isActive),
    deletedAtIdx: index("pos_jaga_deleted_at_idx").on(table.deletedAt),
  }),
);

// ============================================================================
// QR CODES TABLE
// ============================================================================
export const qrCodes = pengamananSchema.table(
  "qr_codes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    qrCode: varchar("qr_code", { length: 255 }).unique().notNull(), // UUID for scanning
    nama: varchar("nama", { length: 255 }).notNull(), // Display name (Block A-123, etc)
    penanggungJawab: varchar("penanggung_jawab", { length: 255 }).notNull(),
    urutan: integer("urutan"), // Use integer (not bigint) to avoid JSON serialization issues
    validFrom: date("valid_from").notNull(),
    validUntil: date("valid_until").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    deletedAt: timestamp("deleted_at"),
    createdBy: uuid("created_by").references(() => users.id),
    updatedBy: uuid("updated_by").references(() => users.id),
  },
  (table) => ({
    qrCodeIdx: index("qr_codes_qr_code_idx").on(table.qrCode),
    namaIdx: index("qr_codes_nama_idx").on(table.nama),
    urutanIdx: index("qr_codes_urutan_idx").on(table.urutan),
    isActiveIdx: index("qr_codes_is_active_idx").on(table.isActive),
    validFromIdx: index("qr_codes_valid_from_idx").on(table.validFrom),
    validUntilIdx: index("qr_codes_valid_until_idx").on(table.validUntil),
    deletedAtIdx: index("qr_codes_deleted_at_idx").on(table.deletedAt),
  }),
);

// ============================================================================
// PENGUMUMAN TABLE
// ============================================================================
export const pengumuman = pengamananSchema.table(
  "pengumuman",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    content: text("content").notNull(),
    priority: varchar("priority", { length: 20 })
      .$type<"normal" | "important" | "urgent">()
      .notNull()
      .default("normal"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    deletedAt: timestamp("deleted_at"),
    createdBy: uuid("created_by").references(() => users.id),
    updatedBy: uuid("updated_by").references(() => users.id),
  },
  (table) => ({
    priorityIdx: index("pengumuman_priority_idx").on(table.priority),
    isActiveIdx: index("pengumuman_is_active_idx").on(table.isActive),
    createdAtIdx: index("pengumuman_created_at_idx").on(table.createdAt),
    deletedAtIdx: index("pengumuman_deleted_at_idx").on(table.deletedAt),
  }),
);

// ============================================================================
// SCAN LOGS TABLE
// ============================================================================
export const scanLogs = pengamananSchema.table(
  "scan_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    qrId: uuid("qr_id")
      .notNull()
      .references(() => qrCodes.id),
    petugasId: uuid("petugas_id")
      .notNull()
      .references(() => petugasJaga.id),
    posId: uuid("pos_id")
      .notNull()
      .references(() => posJaga.id),
    tipeScan: varchar("tipe_scan", { length: 10 })
      .$type<"masuk" | "keluar">()
      .notNull(),
    scannedAt: timestamp("scanned_at").notNull(), // Time when scanned on mobile
    syncedAt: timestamp("synced_at"), // Time when synced to server
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    qrIdIdx: index("scan_logs_qr_id_idx").on(table.qrId),
    petugasIdIdx: index("scan_logs_petugas_id_idx").on(table.petugasId),
    posIdIdx: index("scan_logs_pos_id_idx").on(table.posId),
    tipeScanIdx: index("scan_logs_tipe_scan_idx").on(table.tipeScan),
    scannedAtIdx: index("scan_logs_scanned_at_idx").on(table.scannedAt),
    syncedAtIdx: index("scan_logs_synced_at_idx").on(table.syncedAt),
    createdAtIdx: index("scan_logs_created_at_idx").on(table.createdAt),
  }),
);

// ============================================================================
// PENGUMUMAN READS TABLE
// ============================================================================
export const pengumumanReads = pengamananSchema.table(
  "pengumuman_reads",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    pengumumanId: uuid("pengumuman_id")
      .notNull()
      .references(() => pengumuman.id),
    deviceId: varchar("device_id", { length: 255 }).notNull(), // Mobile device identifier
    readAt: timestamp("read_at").notNull().defaultNow(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    pengumumanIdIdx: index("pengumuman_reads_pengumuman_id_idx").on(
      table.pengumumanId,
    ),
    deviceIdIdx: index("pengumuman_reads_device_id_idx").on(table.deviceId),
    readAtIdx: index("pengumuman_reads_read_at_idx").on(table.readAt),
    // Composite index for checking if user has read announcement
    pengumumanDeviceIdx: index("pengumuman_reads_pengumuman_device_idx").on(
      table.pengumumanId,
      table.deviceId,
    ),
  }),
);

// ============================================================================
// RELATIONS
// ============================================================================
export const usersRelations = relations(users, ({ many }) => ({
  petugasJagaCreated: many(petugasJaga, { relationName: "created_petugas" }),
  petugasJagaUpdated: many(petugasJaga, { relationName: "updated_petugas" }),
  posJagaCreated: many(posJaga, { relationName: "created_pos" }),
  posJagaUpdated: many(posJaga, { relationName: "updated_pos" }),
  qrCodesCreated: many(qrCodes, { relationName: "created_qr" }),
  qrCodesUpdated: many(qrCodes, { relationName: "updated_qr" }),
  pengumumanCreated: many(pengumuman, { relationName: "created_pengumuman" }),
  pengumumanUpdated: many(pengumuman, { relationName: "updated_pengumuman" }),
}));

export const petugasJagaRelations = relations(petugasJaga, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [petugasJaga.createdBy],
    references: [users.id],
    relationName: "created_petugas",
  }),
  updatedBy: one(users, {
    fields: [petugasJaga.updatedBy],
    references: [users.id],
    relationName: "updated_petugas",
  }),
  scanLogs: many(scanLogs),
}));

export const posJagaRelations = relations(posJaga, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [posJaga.createdBy],
    references: [users.id],
    relationName: "created_pos",
  }),
  updatedBy: one(users, {
    fields: [posJaga.updatedBy],
    references: [users.id],
    relationName: "updated_pos",
  }),
  scanLogs: many(scanLogs),
}));

export const qrCodesRelations = relations(qrCodes, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [qrCodes.createdBy],
    references: [users.id],
    relationName: "created_qr",
  }),
  updatedBy: one(users, {
    fields: [qrCodes.updatedBy],
    references: [users.id],
    relationName: "updated_qr",
  }),
  scanLogs: many(scanLogs),
}));

export const pengumumanRelations = relations(pengumuman, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [pengumuman.createdBy],
    references: [users.id],
    relationName: "created_pengumuman",
  }),
  updatedBy: one(users, {
    fields: [pengumuman.updatedBy],
    references: [users.id],
    relationName: "updated_pengumuman",
  }),
  pengumumanReads: many(pengumumanReads),
}));

export const scanLogsRelations = relations(scanLogs, ({ one }) => ({
  qr: one(qrCodes, {
    fields: [scanLogs.qrId],
    references: [qrCodes.id],
  }),
  petugas: one(petugasJaga, {
    fields: [scanLogs.petugasId],
    references: [petugasJaga.id],
  }),
  pos: one(posJaga, {
    fields: [scanLogs.posId],
    references: [posJaga.id],
  }),
}));

export const pengumumanReadsRelations = relations(pengumumanReads, ({ one }) => ({
  pengumuman: one(pengumuman, {
    fields: [pengumumanReads.pengumumanId],
    references: [pengumuman.id],
  }),
}));

// ============================================================================
// TYPES
// ============================================================================
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type PetugasJaga = typeof petugasJaga.$inferSelect;
export type NewPetugasJaga = typeof petugasJaga.$inferInsert;

export type PosJaga = typeof posJaga.$inferSelect;
export type NewPosJaga = typeof posJaga.$inferInsert;

export type QrCode = typeof qrCodes.$inferSelect;
export type NewQrCode = typeof qrCodes.$inferInsert;

export type Pengumuman = typeof pengumuman.$inferSelect;
export type NewPengumuman = typeof pengumuman.$inferInsert;

export type ScanLog = typeof scanLogs.$inferSelect;
export type NewScanLog = typeof scanLogs.$inferInsert;

export type PengumumanRead = typeof pengumumanReads.$inferSelect;
export type NewPengumumanRead = typeof pengumumanReads.$inferInsert;
