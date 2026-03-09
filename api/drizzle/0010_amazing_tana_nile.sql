ALTER TABLE "pokayoke"."scan_logs" ADD COLUMN "delivery_id" varchar(255);--> statement-breakpoint
CREATE INDEX "scan_log_delivery_id_idx" ON "pokayoke"."scan_logs" USING btree ("delivery_id");