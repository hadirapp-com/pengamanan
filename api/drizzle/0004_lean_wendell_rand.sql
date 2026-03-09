ALTER TABLE "pokayoke"."parts_print_history" ADD COLUMN "serial_from" varchar(255);--> statement-breakpoint
ALTER TABLE "pokayoke"."parts_print_history" ADD COLUMN "serial_end" varchar(255);--> statement-breakpoint
ALTER TABLE "pokayoke"."parts_print_history" ADD COLUMN "status" varchar(255) DEFAULT '1' NOT NULL;