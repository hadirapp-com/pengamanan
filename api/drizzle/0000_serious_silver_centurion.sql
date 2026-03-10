CREATE SCHEMA "pengamanan";
--> statement-breakpoint
CREATE TABLE "pengamanan"."pengumuman" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"priority" varchar(20) DEFAULT 'normal' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"created_by" uuid,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE "pengamanan"."pengumuman_reads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pengumuman_id" uuid NOT NULL,
	"device_id" varchar(255) NOT NULL,
	"read_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pengamanan"."petugas_jaga" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nama" varchar(255) NOT NULL,
	"nik" varchar(20),
	"no_hp" varchar(20),
	"pin" varchar(255),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"created_by" uuid,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE "pengamanan"."pos_jaga" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nama" varchar(255) NOT NULL,
	"lokasi" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"created_by" uuid,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE "pengamanan"."qr_codes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"qr_code" varchar(255) NOT NULL,
	"nama" varchar(255) NOT NULL,
	"penanggung_jawab" varchar(255) NOT NULL,
	"valid_from" date NOT NULL,
	"valid_until" date NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"created_by" uuid,
	"updated_by" uuid,
	CONSTRAINT "qr_codes_qr_code_unique" UNIQUE("qr_code")
);
--> statement-breakpoint
CREATE TABLE "pengamanan"."scan_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"qr_id" uuid NOT NULL,
	"petugas_id" uuid NOT NULL,
	"pos_id" uuid NOT NULL,
	"tipe_scan" varchar(10) NOT NULL,
	"scanned_at" timestamp NOT NULL,
	"synced_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pengamanan"."users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" varchar(100) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"role" varchar(20) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"created_by" uuid,
	"updated_by" uuid,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "pengamanan"."pengumuman" ADD CONSTRAINT "pengumuman_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "pengamanan"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pengamanan"."pengumuman" ADD CONSTRAINT "pengumuman_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "pengamanan"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pengamanan"."pengumuman_reads" ADD CONSTRAINT "pengumuman_reads_pengumuman_id_pengumuman_id_fk" FOREIGN KEY ("pengumuman_id") REFERENCES "pengamanan"."pengumuman"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pengamanan"."petugas_jaga" ADD CONSTRAINT "petugas_jaga_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "pengamanan"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pengamanan"."petugas_jaga" ADD CONSTRAINT "petugas_jaga_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "pengamanan"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pengamanan"."pos_jaga" ADD CONSTRAINT "pos_jaga_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "pengamanan"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pengamanan"."pos_jaga" ADD CONSTRAINT "pos_jaga_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "pengamanan"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pengamanan"."qr_codes" ADD CONSTRAINT "qr_codes_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "pengamanan"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pengamanan"."qr_codes" ADD CONSTRAINT "qr_codes_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "pengamanan"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pengamanan"."scan_logs" ADD CONSTRAINT "scan_logs_qr_id_qr_codes_id_fk" FOREIGN KEY ("qr_id") REFERENCES "pengamanan"."qr_codes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pengamanan"."scan_logs" ADD CONSTRAINT "scan_logs_petugas_id_petugas_jaga_id_fk" FOREIGN KEY ("petugas_id") REFERENCES "pengamanan"."petugas_jaga"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pengamanan"."scan_logs" ADD CONSTRAINT "scan_logs_pos_id_pos_jaga_id_fk" FOREIGN KEY ("pos_id") REFERENCES "pengamanan"."pos_jaga"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pengamanan"."users" ADD CONSTRAINT "users_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "pengamanan"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pengamanan"."users" ADD CONSTRAINT "users_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "pengamanan"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "pengumuman_priority_idx" ON "pengamanan"."pengumuman" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "pengumuman_is_active_idx" ON "pengamanan"."pengumuman" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "pengumuman_created_at_idx" ON "pengamanan"."pengumuman" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "pengumuman_deleted_at_idx" ON "pengamanan"."pengumuman" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "pengumuman_reads_pengumuman_id_idx" ON "pengamanan"."pengumuman_reads" USING btree ("pengumuman_id");--> statement-breakpoint
CREATE INDEX "pengumuman_reads_device_id_idx" ON "pengamanan"."pengumuman_reads" USING btree ("device_id");--> statement-breakpoint
CREATE INDEX "pengumuman_reads_read_at_idx" ON "pengamanan"."pengumuman_reads" USING btree ("read_at");--> statement-breakpoint
CREATE INDEX "pengumuman_reads_pengumuman_device_idx" ON "pengamanan"."pengumuman_reads" USING btree ("pengumuman_id","device_id");--> statement-breakpoint
CREATE INDEX "petugas_jaga_nama_idx" ON "pengamanan"."petugas_jaga" USING btree ("nama");--> statement-breakpoint
CREATE INDEX "petugas_jaga_is_active_idx" ON "pengamanan"."petugas_jaga" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "petugas_jaga_deleted_at_idx" ON "pengamanan"."petugas_jaga" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "pos_jaga_nama_idx" ON "pengamanan"."pos_jaga" USING btree ("nama");--> statement-breakpoint
CREATE INDEX "pos_jaga_is_active_idx" ON "pengamanan"."pos_jaga" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "pos_jaga_deleted_at_idx" ON "pengamanan"."pos_jaga" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "qr_codes_qr_code_idx" ON "pengamanan"."qr_codes" USING btree ("qr_code");--> statement-breakpoint
CREATE INDEX "qr_codes_nama_idx" ON "pengamanan"."qr_codes" USING btree ("nama");--> statement-breakpoint
CREATE INDEX "qr_codes_is_active_idx" ON "pengamanan"."qr_codes" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "qr_codes_valid_from_idx" ON "pengamanan"."qr_codes" USING btree ("valid_from");--> statement-breakpoint
CREATE INDEX "qr_codes_valid_until_idx" ON "pengamanan"."qr_codes" USING btree ("valid_until");--> statement-breakpoint
CREATE INDEX "qr_codes_deleted_at_idx" ON "pengamanan"."qr_codes" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "scan_logs_qr_id_idx" ON "pengamanan"."scan_logs" USING btree ("qr_id");--> statement-breakpoint
CREATE INDEX "scan_logs_petugas_id_idx" ON "pengamanan"."scan_logs" USING btree ("petugas_id");--> statement-breakpoint
CREATE INDEX "scan_logs_pos_id_idx" ON "pengamanan"."scan_logs" USING btree ("pos_id");--> statement-breakpoint
CREATE INDEX "scan_logs_tipe_scan_idx" ON "pengamanan"."scan_logs" USING btree ("tipe_scan");--> statement-breakpoint
CREATE INDEX "scan_logs_scanned_at_idx" ON "pengamanan"."scan_logs" USING btree ("scanned_at");--> statement-breakpoint
CREATE INDEX "scan_logs_synced_at_idx" ON "pengamanan"."scan_logs" USING btree ("synced_at");--> statement-breakpoint
CREATE INDEX "scan_logs_created_at_idx" ON "pengamanan"."scan_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "users_username_idx" ON "pengamanan"."users" USING btree ("username");--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "pengamanan"."users" USING btree ("role");--> statement-breakpoint
CREATE INDEX "users_deleted_at_idx" ON "pengamanan"."users" USING btree ("deleted_at");