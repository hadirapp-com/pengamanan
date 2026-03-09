ALTER TABLE "pokayoke"."deliveries" ADD COLUMN "kasai_unique_barcode" varchar(255);--> statement-breakpoint
ALTER TABLE "pokayoke"."deliveries" ADD COLUMN "part_number_kasai" varchar(255);--> statement-breakpoint
ALTER TABLE "pokayoke"."scan_lot_status" ADD COLUMN "kd_lot_no_to" varchar(255);--> statement-breakpoint
ALTER TABLE "pokayoke"."scan_lot_status" ADD COLUMN "po_number" varchar(255);