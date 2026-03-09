ALTER TABLE "pokayoke"."deliveries" ADD COLUMN "delivery_year" integer DEFAULT 2026;--> statement-breakpoint
CREATE INDEX "delivery_year_idx" ON "pokayoke"."deliveries" USING btree ("delivery_year");