ALTER TABLE "pokayoke"."scan_logs" ALTER COLUMN "kasai_barcode" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "pokayoke"."scan_logs" ALTER COLUMN "customer_barcode" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "pokayoke"."deliveries" ADD COLUMN "scan_lt1_qr" varchar(255);--> statement-breakpoint
ALTER TABLE "pokayoke"."deliveries" ADD COLUMN "scan_lt2_qr" varchar(255);--> statement-breakpoint
ALTER TABLE "pokayoke"."scan_logs" ADD COLUMN "first_scan" varchar(255);--> statement-breakpoint
ALTER TABLE "pokayoke"."scan_logs" ADD COLUMN "second_scan" varchar(255);--> statement-breakpoint
CREATE INDEX "scan_lt1_qr_idx" ON "pokayoke"."deliveries" USING btree ("scan_lt1_qr");--> statement-breakpoint
CREATE INDEX "scan_lt2_qr_idx" ON "pokayoke"."deliveries" USING btree ("scan_lt2_qr");