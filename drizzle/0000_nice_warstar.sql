CREATE TYPE "public"."asset_kind" AS ENUM('source_image', 'source_video', 'reference_image', 'reference_video', 'moodboard', 'style_reference', 'mask', 'render_image', 'render_video', 'thumbnail', 'document', 'brand_asset', 'logo', 'export', 'other');--> statement-breakpoint
CREATE TYPE "public"."asset_origin" AS ENUM('upload', 'generation', 'derived', 'import', 'external');--> statement-breakpoint
CREATE TYPE "public"."asset_status" AS ENUM('pending_upload', 'uploaded', 'processing', 'ready', 'failed', 'deleted');--> statement-breakpoint
CREATE TYPE "public"."asset_visibility" AS ENUM('private', 'workspace', 'public');--> statement-breakpoint
CREATE TYPE "public"."deliverable_status" AS ENUM('draft', 'review', 'approved', 'rejected', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."deliverable_type" AS ENUM('hero_render', 'gallery_render', 'animation', 'teaser_video', 'social_clip', 'brochure_asset', 'floorplan', 'other');--> statement-breakpoint
CREATE TYPE "public"."media_type" AS ENUM('image', 'video', 'document', 'audio', 'model_3d', 'archive', 'other');--> statement-breakpoint
CREATE TYPE "public"."project_source_type" AS ENUM('upload', 'remote_url', 'model', 'plan', 'sketch');--> statement-breakpoint
CREATE TYPE "public"."project_status" AS ENUM('draft', 'processing', 'complete', 'failed', 'archived');--> statement-breakpoint
CREATE TYPE "public"."project_type" AS ENUM('residential', 'commercial', 'hospitality', 'mixed_use', 'interior', 'masterplan', 'landscape', 'other');--> statement-breakpoint
CREATE TYPE "public"."provider_type" AS ENUM('openai', 'google', 'kling', 'manual', 'system', 'other');--> statement-breakpoint
CREATE TYPE "public"."subscription_provider" AS ENUM('polar', 'stripe', 'manual', 'none');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('trialing', 'active', 'past_due', 'canceled', 'expired', 'paused');--> statement-breakpoint
CREATE TYPE "public"."tool_run_asset_role" AS ENUM('input', 'reference', 'style', 'mask', 'output', 'thumbnail', 'storyboard', 'brand');--> statement-breakpoint
CREATE TYPE "public"."tool_run_status" AS ENUM('queued', 'running', 'succeeded', 'failed', 'canceled');--> statement-breakpoint
CREATE TYPE "public"."tool_run_type" AS ENUM('image_generation', 'video_generation', 'image_edit', 'video_edit', 'analysis', 'export');--> statement-breakpoint
CREATE TYPE "public"."upload_session_status" AS ENUM('pending', 'uploaded', 'confirmed', 'expired', 'canceled');--> statement-breakpoint
CREATE TYPE "public"."usage_event_type" AS ENUM('credit_grant', 'credit_spend', 'credit_refund', 'storage_upload', 'render_generation', 'video_generation', 'seat_change');--> statement-breakpoint
CREATE TYPE "public"."webhook_status" AS ENUM('received', 'processed', 'failed', 'ignored');--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"password" text,
	"token_type" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assets" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"project_id" text,
	"created_by_user_id" text,
	"source_asset_id" text,
	"source_run_id" text,
	"bucket" text NOT NULL,
	"path" text NOT NULL,
	"asset_kind" "asset_kind" NOT NULL,
	"media_type" "media_type" NOT NULL,
	"origin" "asset_origin" NOT NULL,
	"status" "asset_status" DEFAULT 'pending_upload' NOT NULL,
	"visibility" "asset_visibility" DEFAULT 'private' NOT NULL,
	"original_filename" text,
	"content_type" text,
	"extension" text,
	"byte_size" integer,
	"checksum_sha256" text,
	"width" integer,
	"height" integer,
	"duration_ms" integer,
	"frame_rate" numeric(6, 2),
	"caption" text,
	"alt_text" text,
	"metadata" jsonb,
	"ready_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text,
	"actor_user_id" text,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"action" text NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"payload" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "deliverables" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"project_id" text NOT NULL,
	"asset_id" text NOT NULL,
	"tool_run_id" text,
	"type" "deliverable_type" NOT NULL,
	"status" "deliverable_status" DEFAULT 'draft' NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"published_url" text,
	"published_at" timestamp with time zone,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invitations" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"email" text NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"team_id" text,
	"inviter_id" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "members" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" text DEFAULT 'owner' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"logo" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_versions" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"version_number" integer NOT NULL,
	"created_by_user_id" text NOT NULL,
	"label" text,
	"config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"prompt" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"created_by_user_id" text NOT NULL,
	"updated_by_user_id" text,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"project_type" "project_type" DEFAULT 'other' NOT NULL,
	"source_type" "project_source_type" DEFAULT 'upload' NOT NULL,
	"status" "project_status" DEFAULT 'draft' NOT NULL,
	"template_id" text,
	"custom_prompt" text,
	"settings" jsonb,
	"address_line_1" text,
	"city" text,
	"region" text,
	"postal_code" text,
	"country_code" text,
	"latitude" double precision,
	"longitude" double precision,
	"hero_asset_id" text,
	"latest_run_id" text,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"active_organization_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"provider" "subscription_provider" DEFAULT 'none' NOT NULL,
	"provider_customer_id" text,
	"provider_subscription_id" text,
	"plan_code" text,
	"status" "subscription_status" DEFAULT 'trialing' NOT NULL,
	"current_period_start" timestamp with time zone,
	"current_period_end" timestamp with time zone,
	"cancel_at" timestamp with time zone,
	"trial_ends_at" timestamp with time zone,
	"seats" integer DEFAULT 1 NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tool_run_assets" (
	"id" text PRIMARY KEY NOT NULL,
	"tool_run_id" text NOT NULL,
	"asset_id" text NOT NULL,
	"role" "tool_run_asset_role" NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tool_run_attempts" (
	"id" text PRIMARY KEY NOT NULL,
	"tool_run_id" text NOT NULL,
	"attempt_number" integer NOT NULL,
	"status" "tool_run_status" NOT NULL,
	"provider_request_id" text,
	"request_payload" jsonb,
	"response_payload" jsonb,
	"error_message" text,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tool_runs" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"project_id" text NOT NULL,
	"created_by_user_id" text NOT NULL,
	"project_version_id" text,
	"type" "tool_run_type" NOT NULL,
	"tool_id" text NOT NULL,
	"provider" "provider_type" DEFAULT 'system' NOT NULL,
	"model" text,
	"status" "tool_run_status" DEFAULT 'queued' NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"idempotency_key" text,
	"provider_request_id" text,
	"prompt" text,
	"negative_prompt" text,
	"instructions" text,
	"settings" jsonb,
	"error_code" text,
	"error_message" text,
	"cost_usd" numeric(12, 4),
	"credits_consumed" integer DEFAULT 0 NOT NULL,
	"queued_at" timestamp with time zone DEFAULT now() NOT NULL,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"canceled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "two_factors" (
	"id" text PRIMARY KEY NOT NULL,
	"secret" text NOT NULL,
	"backup_codes" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "upload_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"project_id" text NOT NULL,
	"asset_id" text NOT NULL,
	"requested_by_user_id" text NOT NULL,
	"bucket" text NOT NULL,
	"path" text NOT NULL,
	"content_type" text NOT NULL,
	"max_bytes" integer NOT NULL,
	"status" "upload_session_status" DEFAULT 'pending' NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"uploaded_at" timestamp with time zone,
	"confirmed_at" timestamp with time zone,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "usage_ledger" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"user_id" text,
	"subscription_id" text,
	"project_id" text,
	"tool_run_id" text,
	"event_type" "usage_event_type" NOT NULL,
	"quantity" integer NOT NULL,
	"unit" text DEFAULT 'credits' NOT NULL,
	"balance_after" integer,
	"notes" text,
	"metadata" jsonb,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"name" text,
	"image" text,
	"username" text,
	"display_username" text,
	"two_factor_enabled" boolean DEFAULT false NOT NULL,
	"default_organization_id" text,
	"phone_number" text,
	"marketing_opt_in" boolean DEFAULT false NOT NULL,
	"last_seen_at" timestamp with time zone,
	"billing_customer_id" text,
	"subscription_provider" "subscription_provider" DEFAULT 'none' NOT NULL,
	"subscription_plan" text,
	"subscription_status" "subscription_status",
	"subscription_current_period_end" timestamp with time zone,
	"creations_used" integer DEFAULT 0 NOT NULL,
	"creations_limit" integer DEFAULT 20 NOT NULL,
	"credits_balance" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verifications" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "webhook_events" (
	"id" text PRIMARY KEY NOT NULL,
	"provider" "provider_type" NOT NULL,
	"external_event_id" text NOT NULL,
	"event_type" text,
	"status" "webhook_status" DEFAULT 'received' NOT NULL,
	"payload" jsonb NOT NULL,
	"error_message" text,
	"received_at" timestamp with time zone DEFAULT now() NOT NULL,
	"processed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "workspace_settings" (
	"organization_id" text PRIMARY KEY NOT NULL,
	"timezone" text DEFAULT 'Europe/Madrid' NOT NULL,
	"locale" text DEFAULT 'en' NOT NULL,
	"company_name" text,
	"website_url" text,
	"brand_summary" text,
	"brand_voice" text,
	"primary_color" text,
	"secondary_color" text,
	"accent_color" text,
	"default_image_style" text,
	"default_video_style" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assets" ADD CONSTRAINT "assets_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assets" ADD CONSTRAINT "assets_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assets" ADD CONSTRAINT "assets_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assets" ADD CONSTRAINT "assets_source_asset_id_assets_id_fk" FOREIGN KEY ("source_asset_id") REFERENCES "public"."assets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assets" ADD CONSTRAINT "assets_source_run_id_tool_runs_id_fk" FOREIGN KEY ("source_run_id") REFERENCES "public"."tool_runs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_user_id_users_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deliverables" ADD CONSTRAINT "deliverables_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deliverables" ADD CONSTRAINT "deliverables_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deliverables" ADD CONSTRAINT "deliverables_asset_id_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deliverables" ADD CONSTRAINT "deliverables_tool_run_id_tool_runs_id_fk" FOREIGN KEY ("tool_run_id") REFERENCES "public"."tool_runs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_inviter_id_users_id_fk" FOREIGN KEY ("inviter_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "members" ADD CONSTRAINT "members_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "members" ADD CONSTRAINT "members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_versions" ADD CONSTRAINT "project_versions_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_versions" ADD CONSTRAINT "project_versions_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_updated_by_user_id_users_id_fk" FOREIGN KEY ("updated_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_hero_asset_id_assets_id_fk" FOREIGN KEY ("hero_asset_id") REFERENCES "public"."assets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_latest_run_id_tool_runs_id_fk" FOREIGN KEY ("latest_run_id") REFERENCES "public"."tool_runs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_active_organization_id_organizations_id_fk" FOREIGN KEY ("active_organization_id") REFERENCES "public"."organizations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tool_run_assets" ADD CONSTRAINT "tool_run_assets_tool_run_id_tool_runs_id_fk" FOREIGN KEY ("tool_run_id") REFERENCES "public"."tool_runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tool_run_assets" ADD CONSTRAINT "tool_run_assets_asset_id_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tool_run_attempts" ADD CONSTRAINT "tool_run_attempts_tool_run_id_tool_runs_id_fk" FOREIGN KEY ("tool_run_id") REFERENCES "public"."tool_runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tool_runs" ADD CONSTRAINT "tool_runs_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tool_runs" ADD CONSTRAINT "tool_runs_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tool_runs" ADD CONSTRAINT "tool_runs_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tool_runs" ADD CONSTRAINT "tool_runs_project_version_id_project_versions_id_fk" FOREIGN KEY ("project_version_id") REFERENCES "public"."project_versions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "two_factors" ADD CONSTRAINT "two_factors_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "upload_sessions" ADD CONSTRAINT "upload_sessions_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "upload_sessions" ADD CONSTRAINT "upload_sessions_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "upload_sessions" ADD CONSTRAINT "upload_sessions_asset_id_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "upload_sessions" ADD CONSTRAINT "upload_sessions_requested_by_user_id_users_id_fk" FOREIGN KEY ("requested_by_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usage_ledger" ADD CONSTRAINT "usage_ledger_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usage_ledger" ADD CONSTRAINT "usage_ledger_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usage_ledger" ADD CONSTRAINT "usage_ledger_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usage_ledger" ADD CONSTRAINT "usage_ledger_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usage_ledger" ADD CONSTRAINT "usage_ledger_tool_run_id_tool_runs_id_fk" FOREIGN KEY ("tool_run_id") REFERENCES "public"."tool_runs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_default_organization_id_organizations_id_fk" FOREIGN KEY ("default_organization_id") REFERENCES "public"."organizations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_settings" ADD CONSTRAINT "workspace_settings_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "accounts_user_idx" ON "accounts" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "accounts_provider_account_unique" ON "accounts" USING btree ("provider_id","account_id");--> statement-breakpoint
CREATE UNIQUE INDEX "assets_storage_object_unique" ON "assets" USING btree ("bucket","path");--> statement-breakpoint
CREATE INDEX "assets_project_kind_idx" ON "assets" USING btree ("project_id","asset_kind");--> statement-breakpoint
CREATE INDEX "assets_organization_status_idx" ON "assets" USING btree ("organization_id","status");--> statement-breakpoint
CREATE INDEX "assets_source_run_idx" ON "assets" USING btree ("source_run_id");--> statement-breakpoint
CREATE INDEX "audit_logs_entity_idx" ON "audit_logs" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "audit_logs_organization_idx" ON "audit_logs" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "deliverables_project_status_idx" ON "deliverables" USING btree ("project_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "deliverables_asset_unique" ON "deliverables" USING btree ("asset_id");--> statement-breakpoint
CREATE INDEX "invitations_organization_idx" ON "invitations" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "invitations_email_idx" ON "invitations" USING btree ("email");--> statement-breakpoint
CREATE INDEX "members_organization_idx" ON "members" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "members_user_idx" ON "members" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "members_organization_user_unique" ON "members" USING btree ("organization_id","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "organizations_slug_unique" ON "organizations" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "project_versions_project_version_unique" ON "project_versions" USING btree ("project_id","version_number");--> statement-breakpoint
CREATE INDEX "project_versions_project_idx" ON "project_versions" USING btree ("project_id");--> statement-breakpoint
CREATE UNIQUE INDEX "projects_organization_slug_unique" ON "projects" USING btree ("organization_id","slug");--> statement-breakpoint
CREATE INDEX "projects_organization_status_idx" ON "projects" USING btree ("organization_id","status");--> statement-breakpoint
CREATE INDEX "projects_hero_asset_idx" ON "projects" USING btree ("hero_asset_id");--> statement-breakpoint
CREATE INDEX "projects_latest_run_idx" ON "projects" USING btree ("latest_run_id");--> statement-breakpoint
CREATE INDEX "sessions_user_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sessions_active_organization_idx" ON "sessions" USING btree ("active_organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "subscriptions_organization_unique" ON "subscriptions" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "subscriptions_provider_subscription_unique" ON "subscriptions" USING btree ("provider","provider_subscription_id");--> statement-breakpoint
CREATE INDEX "tool_run_assets_run_role_idx" ON "tool_run_assets" USING btree ("tool_run_id","role");--> statement-breakpoint
CREATE UNIQUE INDEX "tool_run_assets_run_asset_role_unique" ON "tool_run_assets" USING btree ("tool_run_id","asset_id","role");--> statement-breakpoint
CREATE UNIQUE INDEX "tool_run_attempts_run_attempt_unique" ON "tool_run_attempts" USING btree ("tool_run_id","attempt_number");--> statement-breakpoint
CREATE INDEX "tool_runs_project_status_idx" ON "tool_runs" USING btree ("project_id","status");--> statement-breakpoint
CREATE INDEX "tool_runs_organization_idx" ON "tool_runs" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "tool_runs_provider_request_unique" ON "tool_runs" USING btree ("provider","provider_request_id");--> statement-breakpoint
CREATE UNIQUE INDEX "tool_runs_idempotency_unique" ON "tool_runs" USING btree ("idempotency_key");--> statement-breakpoint
CREATE UNIQUE INDEX "two_factors_user_unique" ON "two_factors" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "two_factors_secret_idx" ON "two_factors" USING btree ("secret");--> statement-breakpoint
CREATE UNIQUE INDEX "upload_sessions_asset_unique" ON "upload_sessions" USING btree ("asset_id");--> statement-breakpoint
CREATE INDEX "upload_sessions_project_status_idx" ON "upload_sessions" USING btree ("project_id","status");--> statement-breakpoint
CREATE INDEX "upload_sessions_expires_at_idx" ON "upload_sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "usage_ledger_organization_occurred_idx" ON "usage_ledger" USING btree ("organization_id","occurred_at");--> statement-breakpoint
CREATE INDEX "usage_ledger_user_occurred_idx" ON "usage_ledger" USING btree ("user_id","occurred_at");--> statement-breakpoint
CREATE UNIQUE INDEX "users_username_unique" ON "users" USING btree ("username");--> statement-breakpoint
CREATE INDEX "users_default_organization_idx" ON "users" USING btree ("default_organization_id");--> statement-breakpoint
CREATE INDEX "users_billing_customer_idx" ON "users" USING btree ("billing_customer_id");--> statement-breakpoint
CREATE INDEX "verifications_identifier_idx" ON "verifications" USING btree ("identifier");--> statement-breakpoint
CREATE UNIQUE INDEX "verifications_identifier_value_unique" ON "verifications" USING btree ("identifier","value");--> statement-breakpoint
CREATE UNIQUE INDEX "webhook_events_provider_event_unique" ON "webhook_events" USING btree ("provider","external_event_id");--> statement-breakpoint
CREATE INDEX "webhook_events_status_idx" ON "webhook_events" USING btree ("status");