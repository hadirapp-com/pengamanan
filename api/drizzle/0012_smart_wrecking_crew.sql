CREATE TABLE "pokayoke"."configs" (
	"id" varchar(100) PRIMARY KEY NOT NULL,
	"key" varchar(255) NOT NULL,
	"value" jsonb NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "configs_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE INDEX "config_key_idx" ON "pokayoke"."configs" USING btree ("key");