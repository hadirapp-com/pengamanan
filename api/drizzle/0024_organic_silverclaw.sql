ALTER TABLE "pokayoke"."scan_logs" ALTER COLUMN "part_number" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "pokayoke"."scan_logs" ALTER COLUMN "part_name" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "pokayoke"."scan_logs" ALTER COLUMN "color_code" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "pokayoke"."scan_logs" ALTER COLUMN "delivery_year" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "pokayoke"."scan_logs" ALTER COLUMN "scan_status" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "pokayoke"."scan_logs" ADD COLUMN "device_id" varchar(255);--> statement-breakpoint
ALTER TABLE "pokayoke"."scan_logs" ADD COLUMN "user_id" varchar(255);--> statement-breakpoint
ALTER TABLE "pokayoke"."scan_logs" ADD COLUMN "session_status" varchar(50);--> statement-breakpoint
ALTER TABLE "pokayoke"."scan_logs" ADD COLUMN "start_time" timestamp;--> statement-breakpoint
ALTER TABLE "pokayoke"."scan_logs" ADD COLUMN "end_time" timestamp;--> statement-breakpoint
ALTER TABLE "pokayoke"."scan_logs" ADD COLUMN "events" jsonb;--> statement-breakpoint
ALTER TABLE "pokayoke"."scan_logs" ADD COLUMN "synced_at" timestamp;--> statement-breakpoint
ALTER TABLE "pokayoke"."scan_logs" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
CREATE INDEX "scan_log_device_id_idx" ON "pokayoke"."scan_logs" USING btree ("device_id");--> statement-breakpoint
CREATE INDEX "scan_log_user_id_idx" ON "pokayoke"."scan_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "scan_log_session_status_idx" ON "pokayoke"."scan_logs" USING btree ("session_status");--> statement-breakpoint
CREATE INDEX "scan_log_synced_at_idx" ON "pokayoke"."scan_logs" USING btree ("synced_at");