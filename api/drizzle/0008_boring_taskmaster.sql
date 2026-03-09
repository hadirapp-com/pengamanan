ALTER TABLE "pokayoke"."deliveries" ADD COLUMN "scan_lot_status" varchar(255);--> statement-breakpoint
ALTER TABLE "pokayoke"."deliveries" ADD COLUMN "scan_lot_by" varchar(255);--> statement-breakpoint
ALTER TABLE "pokayoke"."deliveries" ADD COLUMN "scan_lot_start_at" timestamp;--> statement-breakpoint
ALTER TABLE "pokayoke"."deliveries" ADD COLUMN "scan_lot_completed_at" timestamp;--> statement-breakpoint
ALTER TABLE "pokayoke"."deliveries" ADD COLUMN "scan_lot_bypassed" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "pokayoke"."deliveries" ADD COLUMN "scan_lot_bypassed_at" timestamp;--> statement-breakpoint
ALTER TABLE "pokayoke"."deliveries" ADD COLUMN "scan_lot_bypassed_by" varchar(255);--> statement-breakpoint
ALTER TABLE "pokayoke"."deliveries" ADD COLUMN "scan_lot_bypassed_reason" text;--> statement-breakpoint
CREATE INDEX "scan_lt1_by_idx" ON "pokayoke"."deliveries" USING btree ("scan_lt1_by");--> statement-breakpoint
CREATE INDEX "scan_lt2_by_idx" ON "pokayoke"."deliveries" USING btree ("scan_lt2_by");--> statement-breakpoint
CREATE INDEX "scan_lt1_at_idx" ON "pokayoke"."deliveries" USING btree ("scan_lt1_at");--> statement-breakpoint
CREATE INDEX "scan_lt2_at_idx" ON "pokayoke"."deliveries" USING btree ("scan_lt2_at");