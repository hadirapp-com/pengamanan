ALTER TABLE "pokayoke"."deliveries" ADD COLUMN "po_number" varchar(255);--> statement-breakpoint
CREATE INDEX "po_number_idx" ON "pokayoke"."deliveries" USING btree ("po_number");