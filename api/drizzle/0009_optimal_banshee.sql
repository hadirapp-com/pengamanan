CREATE TABLE "pokayoke"."scan_logs" (
	"id" varchar(100) PRIMARY KEY NOT NULL,
	"customer_id" varchar(255) NOT NULL,
	"customer" varchar(255) NOT NULL,
	"part_number" varchar(255) NOT NULL,
	"part_name" varchar(255) NOT NULL,
	"color_code" varchar(255) NOT NULL,
	"lot" varchar(255) NOT NULL,
	"delivery_year" varchar(10) NOT NULL,
	"scan_by" varchar(255) NOT NULL,
	"scan_type" varchar(50) NOT NULL,
	"kasai_barcode" varchar(255) NOT NULL,
	"customer_barcode" varchar(255) NOT NULL,
	"scan_status" varchar(50) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "scan_log_customer_id_idx" ON "pokayoke"."scan_logs" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "scan_log_lot_idx" ON "pokayoke"."scan_logs" USING btree ("lot");--> statement-breakpoint
CREATE INDEX "scan_log_scan_by_idx" ON "pokayoke"."scan_logs" USING btree ("scan_by");--> statement-breakpoint
CREATE INDEX "scan_log_type_idx" ON "pokayoke"."scan_logs" USING btree ("scan_type");--> statement-breakpoint
CREATE INDEX "scan_log_status_idx" ON "pokayoke"."scan_logs" USING btree ("scan_status");--> statement-breakpoint
CREATE INDEX "scan_log_created_at_idx" ON "pokayoke"."scan_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "scan_log_delivery_year_idx" ON "pokayoke"."scan_logs" USING btree ("delivery_year");