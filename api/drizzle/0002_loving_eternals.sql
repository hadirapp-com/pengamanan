ALTER TABLE "pokayoke"."customers" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "pokayoke"."parts" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "pokayoke"."users" ADD COLUMN "deleted_at" timestamp;