CREATE TYPE "public"."generation_status" AS ENUM('queued', 'running', 'succeeded', 'failed');--> statement-breakpoint
CREATE TYPE "public"."object_type" AS ENUM('car', 'jet', 'yacht', 'watch', 'jewelry', 'accessory', 'scene', 'other');--> statement-breakpoint
CREATE TYPE "public"."project_source_type" AS ENUM('avatar', 'upload');--> statement-breakpoint
CREATE TYPE "public"."project_status" AS ENUM('draft', 'processing', 'complete', 'failed');--> statement-breakpoint
CREATE TYPE "public"."template_type" AS ENUM('scene', 'photo_swap');--> statement-breakpoint
CREATE TABLE "avatar_images" (
	"id" text PRIMARY KEY NOT NULL,
	"avatar_id" text NOT NULL,
	"storage_key" text NOT NULL,
	"metadata" json,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "avatars" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "object_catalog" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" "object_type" NOT NULL,
	"slug" text,
	"base_prompt" text,
	"metadata" json,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "object_images" (
	"id" text PRIMARY KEY NOT NULL,
	"object_id" text NOT NULL,
	"storage_key" text NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_generations" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"status" "generation_status" DEFAULT 'queued' NOT NULL,
	"final_prompt" text,
	"input_images" json,
	"model_params" json,
	"error_message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "project_input_images" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"storage_key" text NOT NULL,
	"metadata" json,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_objects" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"object_id" text,
	"object_type" text,
	"object_name" text,
	"settings" json,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_outputs" (
	"id" text PRIMARY KEY NOT NULL,
	"project_generation_id" text NOT NULL,
	"project_id" text NOT NULL,
	"storage_key" text NOT NULL,
	"thumbnail_key" text,
	"metadata" json,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" text,
	"source_type" "project_source_type" NOT NULL,
	"template_id" text,
	"status" "project_status" DEFAULT 'draft' NOT NULL,
	"advanced_settings" json,
	"custom_prompt" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "template_images" (
	"id" text PRIMARY KEY NOT NULL,
	"template_id" text NOT NULL,
	"storage_key" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "generation_objects" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "generations" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "luxury_objects" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "user_images" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "generation_objects" CASCADE;--> statement-breakpoint
DROP TABLE "generations" CASCADE;--> statement-breakpoint
DROP TABLE "luxury_objects" CASCADE;--> statement-breakpoint
DROP TABLE "user_images" CASCADE;--> statement-breakpoint
ALTER TABLE "templates" ALTER COLUMN "category" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN "type" "template_type" NOT NULL;--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN "default_settings" json;--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "avatar_images" ADD CONSTRAINT "avatar_images_avatar_id_avatars_id_fk" FOREIGN KEY ("avatar_id") REFERENCES "public"."avatars"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "avatars" ADD CONSTRAINT "avatars_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "object_images" ADD CONSTRAINT "object_images_object_id_object_catalog_id_fk" FOREIGN KEY ("object_id") REFERENCES "public"."object_catalog"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_generations" ADD CONSTRAINT "project_generations_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_input_images" ADD CONSTRAINT "project_input_images_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_objects" ADD CONSTRAINT "project_objects_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_objects" ADD CONSTRAINT "project_objects_object_id_object_catalog_id_fk" FOREIGN KEY ("object_id") REFERENCES "public"."object_catalog"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_outputs" ADD CONSTRAINT "project_outputs_project_generation_id_project_generations_id_fk" FOREIGN KEY ("project_generation_id") REFERENCES "public"."project_generations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_outputs" ADD CONSTRAINT "project_outputs_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_template_id_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."templates"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "template_images" ADD CONSTRAINT "template_images_template_id_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."templates"("id") ON DELETE cascade ON UPDATE no action;