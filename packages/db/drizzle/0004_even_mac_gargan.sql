CREATE TYPE "public"."media_type" AS ENUM('image', 'video');--> statement-breakpoint
CREATE TYPE "public"."hotspot_type" AS ENUM('click_zone', 'area', 'callout');--> statement-breakpoint
ALTER TABLE "steps" ADD COLUMN "media_type" "media_type" DEFAULT 'image' NOT NULL;--> statement-breakpoint
ALTER TABLE "steps" ADD COLUMN "video_url" text;--> statement-breakpoint
ALTER TABLE "hotspots" ADD COLUMN "type" "hotspot_type" DEFAULT 'click_zone' NOT NULL;--> statement-breakpoint
ALTER TABLE "hotspots" ADD COLUMN "open_by_default" boolean DEFAULT false NOT NULL;