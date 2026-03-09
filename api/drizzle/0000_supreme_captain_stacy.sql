CREATE SCHEMA "pokayoke";
--> statement-breakpoint
CREATE TABLE "pokayoke"."customers" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"address" text,
	"alias" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pokayoke"."deliveries" (
	"id" text PRIMARY KEY NOT NULL,
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
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pokayoke"."menus" (
	"id" text PRIMARY KEY NOT NULL,
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
CREATE TABLE "pokayoke"."users" (
	"id" text PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"role" text DEFAULT 'user' NOT NULL,
	"email" text,
	"full_name" text,
	"nik" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE INDEX "customer_id_idx" ON "pokayoke"."deliveries" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "date_idx" ON "pokayoke"."deliveries" USING btree ("date");--> statement-breakpoint
CREATE INDEX "time_idx" ON "pokayoke"."deliveries" USING btree ("time");--> statement-breakpoint
CREATE INDEX "adjust_date_idx" ON "pokayoke"."deliveries" USING btree ("adjust_date");--> statement-breakpoint
CREATE INDEX "adjust_time_idx" ON "pokayoke"."deliveries" USING btree ("adjust_time");--> statement-breakpoint
CREATE INDEX "barcode_hpm_idx" ON "pokayoke"."deliveries" USING btree ("barcode_hpm");--> statement-breakpoint
CREATE INDEX "barcode_kasai_idx" ON "pokayoke"."deliveries" USING btree ("barcode_kasai");--> statement-breakpoint
CREATE INDEX "slip_number_idx" ON "pokayoke"."deliveries" USING btree ("slip_number");--> statement-breakpoint
CREATE INDEX "parent_id_idx" ON "pokayoke"."menus" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "order_idx" ON "pokayoke"."menus" USING btree ("order");--> statement-breakpoint
CREATE INDEX "is_active_idx" ON "pokayoke"."menus" USING btree ("is_active");