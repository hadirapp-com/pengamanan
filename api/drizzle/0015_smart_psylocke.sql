ALTER TABLE "pokayoke"."parts" ALTER COLUMN "model" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "pokayoke"."parts" ALTER COLUMN "indication" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "pokayoke"."parts" ALTER COLUMN "left_hand" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "pokayoke"."parts" ALTER COLUMN "left_hand" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "pokayoke"."parts" ALTER COLUMN "right_hand" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "pokayoke"."parts" ALTER COLUMN "right_hand" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "pokayoke"."parts" ADD COLUMN "lh_rh" boolean;