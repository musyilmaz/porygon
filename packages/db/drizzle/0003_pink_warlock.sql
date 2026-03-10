CREATE TABLE "demo_views" (
	"id" text PRIMARY KEY NOT NULL,
	"demo_id" text NOT NULL,
	"viewer_hash" text NOT NULL,
	"steps_viewed" integer DEFAULT 0 NOT NULL,
	"total_steps" integer NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"referrer" text,
	"user_agent" text,
	"country" text,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "demo_views" ADD CONSTRAINT "demo_views_demo_id_demos_id_fk" FOREIGN KEY ("demo_id") REFERENCES "public"."demos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "demo_views_demo_id_idx" ON "demo_views" USING btree ("demo_id");--> statement-breakpoint
CREATE INDEX "demo_views_started_at_idx" ON "demo_views" USING btree ("started_at");