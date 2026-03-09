CREATE TABLE "pokayoke"."parts_print_history" (
	"id" varchar(100) PRIMARY KEY NOT NULL,
	"part_id" varchar(255) NOT NULL,
	"qty_label" varchar(255) NOT NULL,
	"qty_part" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
