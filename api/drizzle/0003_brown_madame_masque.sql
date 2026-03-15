ALTER TABLE "pengamanan"."qr_codes" ADD COLUMN "urutan" bigint;--> statement-breakpoint
CREATE INDEX "qr_codes_urutan_idx" ON "pengamanan"."qr_codes" USING btree ("urutan");