CREATE SCHEMA "pokayoke";
--> statement-breakpoint
CREATE TABLE "pokayoke"."configs" (
	"id" varchar(100) PRIMARY KEY NOT NULL,
	"key" varchar(255) NOT NULL,
	"value" jsonb NOT NULL,
	"description" text,
	"allow_delete" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "configs_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "pokayoke"."customers" (
	"id" varchar(100) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"address" text,
	"alias" varchar(255) NOT NULL,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pokayoke"."deliveries" (
	"id" varchar(100) PRIMARY KEY NOT NULL,
	"customer_id" varchar(255) NOT NULL,
	"order_no" varchar(255) NOT NULL,
	"file" varchar(255) NOT NULL,
	"part_number_raw" varchar(255) NOT NULL,
	"part_number" varchar(255) NOT NULL,
	"part_name" varchar(255) NOT NULL,
	"color_code" varchar(255) NOT NULL,
	"seq_prod" varchar(255) NOT NULL,
	"kd_lot_no" varchar(255) NOT NULL,
	"qty" varchar(255) NOT NULL,
	"date" varchar(255) NOT NULL,
	"time" varchar(255) NOT NULL,
	"adjust_date" varchar(255),
	"adjust_time" varchar(255),
	"slip_number" varchar(255) NOT NULL,
	"remarks_bawah" varchar(255) NOT NULL,
	"barcode_hpm" varchar(255) NOT NULL,
	"barcode_kasai_raw" varchar(255) NOT NULL,
	"barcode_kasai" varchar(255) NOT NULL,
	"scan_lt1_by" varchar(255),
	"scan_lt1_by_name" varchar(255),
	"scan_lt1_at" timestamp,
	"scan_lt2_by" varchar(255),
	"scan_lt2_by_name" varchar(255),
	"scan_lt2_at" timestamp,
	"scan_lt1_qr" varchar(255),
	"scan_lt2_qr" varchar(255),
	"po_number" varchar(255),
	"preparation_unique_barcode" varchar(255),
	"delivery_unique_barcode" varchar(255),
	"part_number_kasai" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"delivery_year" integer DEFAULT 2026
);
--> statement-breakpoint
CREATE TABLE "pokayoke"."menus" (
	"id" varchar(100) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"href" varchar(255) NOT NULL,
	"icon" varchar(255),
	"has_children" text DEFAULT 'false' NOT NULL,
	"parent_id" text,
	"order" text DEFAULT '0' NOT NULL,
	"is_active" text DEFAULT 'true' NOT NULL,
	"allowed_roles" text DEFAULT 'admin,user' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pokayoke"."parts" (
	"id" varchar(100) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"no" varchar(255) NOT NULL,
	"color_code" varchar(255),
	"customer_id" varchar(255) NOT NULL,
	"model" varchar(255),
	"qty_per_pack" integer NOT NULL,
	"label_size" varchar(255),
	"indication" varchar(255),
	"left_hand" boolean,
	"right_hand" boolean,
	"lh_rh" boolean,
	"label_color" varchar(255) DEFAULT 'White',
	"is_active" boolean DEFAULT true,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pokayoke"."parts_print_history" (
	"id" varchar(100) PRIMARY KEY NOT NULL,
	"part_id" varchar(255) NOT NULL,
	"production_date" date,
	"qty_label" integer NOT NULL,
	"qty_part" integer NOT NULL,
	"serial_from" varchar(255),
	"serial_end" varchar(255),
	"status" varchar(255) DEFAULT '1' NOT NULL,
	"print_by" varchar(255),
	"print_by_name" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pokayoke"."scan_logs" (
	"id" varchar(100) PRIMARY KEY NOT NULL,
	"customer_id" varchar(255) NOT NULL,
	"customer" varchar(255) NOT NULL,
	"delivery_id" varchar(255),
	"part_number" varchar(255),
	"part_name" varchar(255),
	"color_code" varchar(255),
	"lot" varchar(255) NOT NULL,
	"delivery_year" varchar(10),
	"scan_by" varchar(255) NOT NULL,
	"scan_type" varchar(50) NOT NULL,
	"kasai_barcode" varchar(255),
	"customer_barcode" varchar(255),
	"first_scan" varchar(255),
	"second_scan" varchar(255),
	"scan_status" varchar(50),
	"device_id" varchar(255),
	"user_id" varchar(255),
	"session_status" varchar(50),
	"start_time" timestamp,
	"end_time" timestamp,
	"events" jsonb,
	"synced_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pokayoke"."scan_lot_status" (
	"id" varchar(100) PRIMARY KEY NOT NULL,
	"kd_lot_no" varchar(255),
	"customer_id" varchar(255),
	"preparation_status" varchar(255),
	"delivery_status" varchar(255),
	"preparation_by" varchar(255),
	"preparation_started_at" timestamp,
	"preparation_completed_at" timestamp,
	"preparation_bypassed_at" timestamp,
	"preparation_bypassed_by" varchar(255),
	"preparation_bypassed_reason" text,
	"delivery_by" varchar(255),
	"delivery_started_at" timestamp,
	"delivery_completed_at" timestamp,
	"delivery_bypassed_at" timestamp,
	"delivery_bypassed_by" varchar(255),
	"kd_lot_no_to" varchar(255),
	"po_number" varchar(255),
	"add_column" varchar(255),
	"delivery_bypassed_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pokayoke"."users" (
	"id" varchar(100) PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"role" text NOT NULL,
	"email" text,
	"email_verified" boolean DEFAULT false NOT NULL,
	"email_verification_token" text,
	"reset_password_token" text,
	"reset_password_expires" timestamp,
	"full_name" text,
	"nik" text,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE INDEX "config_key_idx" ON "pokayoke"."configs" USING btree ("key");--> statement-breakpoint
CREATE INDEX "customer_id_idx" ON "pokayoke"."deliveries" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "date_idx" ON "pokayoke"."deliveries" USING btree ("date");--> statement-breakpoint
CREATE INDEX "time_idx" ON "pokayoke"."deliveries" USING btree ("time");--> statement-breakpoint
CREATE INDEX "adjust_date_idx" ON "pokayoke"."deliveries" USING btree ("adjust_date");--> statement-breakpoint
CREATE INDEX "adjust_time_idx" ON "pokayoke"."deliveries" USING btree ("adjust_time");--> statement-breakpoint
CREATE INDEX "barcode_hpm_idx" ON "pokayoke"."deliveries" USING btree ("barcode_hpm");--> statement-breakpoint
CREATE INDEX "barcode_kasai_idx" ON "pokayoke"."deliveries" USING btree ("barcode_kasai");--> statement-breakpoint
CREATE INDEX "slip_number_idx" ON "pokayoke"."deliveries" USING btree ("slip_number");--> statement-breakpoint
CREATE INDEX "delivery_year_idx" ON "pokayoke"."deliveries" USING btree ("delivery_year");--> statement-breakpoint
CREATE INDEX "po_number_idx" ON "pokayoke"."deliveries" USING btree ("po_number");--> statement-breakpoint
CREATE INDEX "scan_lt1_by_idx" ON "pokayoke"."deliveries" USING btree ("scan_lt1_by");--> statement-breakpoint
CREATE INDEX "scan_lt2_by_idx" ON "pokayoke"."deliveries" USING btree ("scan_lt2_by");--> statement-breakpoint
CREATE INDEX "scan_lt1_at_idx" ON "pokayoke"."deliveries" USING btree ("scan_lt1_at");--> statement-breakpoint
CREATE INDEX "scan_lt2_at_idx" ON "pokayoke"."deliveries" USING btree ("scan_lt2_at");--> statement-breakpoint
CREATE INDEX "scan_lt1_qr_idx" ON "pokayoke"."deliveries" USING btree ("scan_lt1_qr");--> statement-breakpoint
CREATE INDEX "scan_lt2_qr_idx" ON "pokayoke"."deliveries" USING btree ("scan_lt2_qr");--> statement-breakpoint
CREATE INDEX "parent_id_idx" ON "pokayoke"."menus" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "order_idx" ON "pokayoke"."menus" USING btree ("order");--> statement-breakpoint
CREATE INDEX "is_active_idx" ON "pokayoke"."menus" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "scan_log_customer_id_idx" ON "pokayoke"."scan_logs" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "scan_log_delivery_id_idx" ON "pokayoke"."scan_logs" USING btree ("delivery_id");--> statement-breakpoint
CREATE INDEX "scan_log_lot_idx" ON "pokayoke"."scan_logs" USING btree ("lot");--> statement-breakpoint
CREATE INDEX "scan_log_scan_by_idx" ON "pokayoke"."scan_logs" USING btree ("scan_by");--> statement-breakpoint
CREATE INDEX "scan_log_type_idx" ON "pokayoke"."scan_logs" USING btree ("scan_type");--> statement-breakpoint
CREATE INDEX "scan_log_status_idx" ON "pokayoke"."scan_logs" USING btree ("scan_status");--> statement-breakpoint
CREATE INDEX "scan_log_created_at_idx" ON "pokayoke"."scan_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "scan_log_delivery_year_idx" ON "pokayoke"."scan_logs" USING btree ("delivery_year");--> statement-breakpoint
CREATE INDEX "scan_log_device_id_idx" ON "pokayoke"."scan_logs" USING btree ("device_id");--> statement-breakpoint
CREATE INDEX "scan_log_user_id_idx" ON "pokayoke"."scan_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "scan_log_session_status_idx" ON "pokayoke"."scan_logs" USING btree ("session_status");--> statement-breakpoint
CREATE INDEX "scan_log_synced_at_idx" ON "pokayoke"."scan_logs" USING btree ("synced_at");--> statement-breakpoint
CREATE INDEX "lot_status_kd_lot_no_idx" ON "pokayoke"."scan_lot_status" USING btree ("kd_lot_no");--> statement-breakpoint
CREATE INDEX "lot_status_customer_id_idx" ON "pokayoke"."scan_lot_status" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "lot_status_preparation_status_idx" ON "pokayoke"."scan_lot_status" USING btree ("preparation_status");--> statement-breakpoint
CREATE INDEX "lot_status_delivery_status_idx" ON "pokayoke"."scan_lot_status" USING btree ("delivery_status");