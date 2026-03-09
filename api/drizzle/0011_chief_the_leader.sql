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
	"delivery_bypassed_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "pokayoke"."users" ALTER COLUMN "role" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "pokayoke"."users" ADD COLUMN "email_verified" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "pokayoke"."users" ADD COLUMN "email_verification_token" text;--> statement-breakpoint
ALTER TABLE "pokayoke"."users" ADD COLUMN "reset_password_token" text;--> statement-breakpoint
ALTER TABLE "pokayoke"."users" ADD COLUMN "reset_password_expires" timestamp;--> statement-breakpoint
CREATE INDEX "lot_status_kd_lot_no_idx" ON "pokayoke"."scan_lot_status" USING btree ("kd_lot_no");--> statement-breakpoint
CREATE INDEX "lot_status_customer_id_idx" ON "pokayoke"."scan_lot_status" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "lot_status_preparation_status_idx" ON "pokayoke"."scan_lot_status" USING btree ("preparation_status");--> statement-breakpoint
CREATE INDEX "lot_status_delivery_status_idx" ON "pokayoke"."scan_lot_status" USING btree ("delivery_status");