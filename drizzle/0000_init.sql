CREATE TYPE "public"."comment_status" AS ENUM('pending', 'approved', 'rejected', 'spam');--> statement-breakpoint
CREATE TYPE "public"."post_status" AS ENUM('draft', 'published');--> statement-breakpoint
CREATE TABLE "certificates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"legacy_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"title_en" text NOT NULL,
	"title_es" text DEFAULT '' NOT NULL,
	"issuer_en" text DEFAULT '' NOT NULL,
	"issuer_es" text DEFAULT '' NOT NULL,
	"url" text,
	"file_en_url" text,
	"file_es_url" text,
	"image_url" text,
	"image_alt" text,
	"thumbnail_url" text,
	CONSTRAINT "certificates_legacy_id_unique" UNIQUE("legacy_id")
);
--> statement-breakpoint
CREATE TABLE "comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" uuid NOT NULL,
	"lang" text NOT NULL,
	"name" text NOT NULL,
	"body" text NOT NULL,
	"status" "comment_status" DEFAULT 'pending' NOT NULL,
	"ip_hash" text NOT NULL,
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"approved_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "education" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"legacy_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"institution_en" text NOT NULL,
	"institution_es" text DEFAULT '' NOT NULL,
	"degree_en" text DEFAULT '' NOT NULL,
	"degree_es" text DEFAULT '' NOT NULL,
	"start_date" date,
	"end_date" date,
	"url" text,
	"country" text DEFAULT '' NOT NULL,
	"image_url" text,
	"image_alt" text,
	CONSTRAINT "education_legacy_id_unique" UNIQUE("legacy_id")
);
--> statement-breakpoint
CREATE TABLE "experiences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"legacy_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"title_en" text NOT NULL,
	"title_es" text DEFAULT '' NOT NULL,
	"company" text DEFAULT '' NOT NULL,
	"company_url" text,
	"country" text DEFAULT '' NOT NULL,
	"mode_en" text DEFAULT '' NOT NULL,
	"mode_es" text DEFAULT '' NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date,
	"description_en" text DEFAULT '' NOT NULL,
	"description_es" text DEFAULT '' NOT NULL,
	"technologies" text[] DEFAULT '{}' NOT NULL,
	"image_url" text,
	"image_alt" text,
	CONSTRAINT "experiences_legacy_id_unique" UNIQUE("legacy_id")
);
--> statement-breakpoint
CREATE TABLE "post_slug_redirects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" uuid NOT NULL,
	"lang" text NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "post_views" (
	"post_id" uuid PRIMARY KEY NOT NULL,
	"count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"status" "post_status" DEFAULT 'draft' NOT NULL,
	"published_at" timestamp with time zone,
	"cover_url" text,
	"cover_alt_en" text,
	"cover_alt_es" text,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"title_en" text,
	"slug_en" text,
	"excerpt_en" text,
	"content_en" text,
	"reading_time_en" integer,
	"title_es" text,
	"slug_es" text,
	"excerpt_es" text,
	"content_es" text,
	"reading_time_es" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profile" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"legacy_id" text,
	"name" text NOT NULL,
	"headline_en" text DEFAULT '' NOT NULL,
	"headline_es" text DEFAULT '' NOT NULL,
	"bio_en" text DEFAULT '' NOT NULL,
	"bio_es" text DEFAULT '' NOT NULL,
	"location" text DEFAULT '' NOT NULL,
	"email" text DEFAULT '' NOT NULL,
	"phone" text,
	"username" text,
	"website" text,
	"github" text,
	"linkedin" text,
	"twitter" text,
	"facebook" text,
	"skills_en" text[] DEFAULT '{}' NOT NULL,
	"skills_es" text[] DEFAULT '{}' NOT NULL,
	"photo_url" text,
	"photo_alt" text,
	"cv_en_url" text,
	"cv_es_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "profile_legacy_id_unique" UNIQUE("legacy_id")
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"legacy_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"title_en" text NOT NULL,
	"title_es" text DEFAULT '' NOT NULL,
	"slug" text,
	"url" text,
	"description_en" text DEFAULT '' NOT NULL,
	"description_es" text DEFAULT '' NOT NULL,
	"technologies" text[] DEFAULT '{}' NOT NULL,
	"image_url" text,
	"image_alt" text,
	"role_en" text,
	"role_es" text,
	"client" text,
	"date" date,
	"problem_en" text,
	"problem_es" text,
	"solution_en" text,
	"solution_es" text,
	"result_en" text,
	"result_es" text,
	CONSTRAINT "projects_legacy_id_unique" UNIQUE("legacy_id"),
	CONSTRAINT "projects_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "skills" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"legacy_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"name" text NOT NULL,
	"icon_url" text DEFAULT '' NOT NULL,
	"level" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "skills_legacy_id_unique" UNIQUE("legacy_id")
);
--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_slug_redirects" ADD CONSTRAINT "post_slug_redirects_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_views" ADD CONSTRAINT "post_views_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "comments_post_status_idx" ON "comments" USING btree ("post_id","status");--> statement-breakpoint
CREATE INDEX "comments_ip_created_idx" ON "comments" USING btree ("ip_hash","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "post_slug_redirects_lang_slug_idx" ON "post_slug_redirects" USING btree ("lang","slug");--> statement-breakpoint
CREATE UNIQUE INDEX "posts_slug_en_idx" ON "posts" USING btree ("slug_en");--> statement-breakpoint
CREATE UNIQUE INDEX "posts_slug_es_idx" ON "posts" USING btree ("slug_es");--> statement-breakpoint
CREATE INDEX "posts_status_published_idx" ON "posts" USING btree ("status","published_at");