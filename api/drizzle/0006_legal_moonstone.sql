ALTER TABLE "pokayoke"."parts" ALTER COLUMN "qty_per_pack" SET DATA TYPE integer USING "qty_per_pack"::integer;--> statement-breakpoint
ALTER TABLE "pokayoke"."parts_print_history" ALTER COLUMN "qty_label" SET DATA TYPE integer USING "qty_label"::integer;--> statement-breakpoint
ALTER TABLE "pokayoke"."parts_print_history" ALTER COLUMN "qty_part" SET DATA TYPE integer USING "qty_part"::integer;