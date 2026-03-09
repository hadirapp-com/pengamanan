CREATE TABLE "pokayoke"."parts" (
	"id" varchar(100) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"no" varchar(255) NOT NULL,
	"color_code" varchar(255) NOT NULL,
	"customer_id" varchar(255) NOT NULL,
	"model" varchar(255) NOT NULL,
	"qty_per_pack" varchar(255) NOT NULL,
	"indication" varchar(255) NOT NULL,
	"left_hand" boolean DEFAULT false NOT NULL,
	"right_hand" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "pokayoke"."customers" ALTER COLUMN "id" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "pokayoke"."deliveries" ALTER COLUMN "id" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "pokayoke"."menus" ALTER COLUMN "id" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "pokayoke"."users" ALTER COLUMN "id" SET DATA TYPE varchar(100);