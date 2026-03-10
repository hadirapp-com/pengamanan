CREATE TABLE "pengamanan"."configs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" varchar(100) NOT NULL,
	"value" text NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_by" uuid,
	CONSTRAINT "configs_key_unique" UNIQUE("key")
);
--> statement-breakpoint
ALTER TABLE "pengamanan"."configs" ADD CONSTRAINT "configs_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "pengamanan"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pengamanan"."configs" ADD CONSTRAINT "configs_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "pengamanan"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "configs_key_idx" ON "pengamanan"."configs" USING btree ("key");--> statement-breakpoint
CREATE INDEX "configs_is_active_idx" ON "pengamanan"."configs" USING btree ("is_active");--> statement-breakpoint
ALTER TABLE "pengamanan"."petugas_jaga" DROP COLUMN "pin";