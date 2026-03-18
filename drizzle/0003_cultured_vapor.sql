CREATE TYPE "public"."checkout_attribution_status" AS ENUM('initiated', 'purchase_failed', 'purchased');--> statement-breakpoint
CREATE TABLE "checkout_attributions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"organization_id" text,
	"provider" "subscription_provider" DEFAULT 'polar' NOT NULL,
	"status" "checkout_attribution_status" DEFAULT 'initiated' NOT NULL,
	"plan_code" text NOT NULL,
	"source" text,
	"initiate_checkout_event_id" text NOT NULL,
	"purchase_event_id" text NOT NULL,
	"checkout_value" numeric(10, 2) NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"meta_fbp" text,
	"meta_fbc" text,
	"client_user_agent" text,
	"client_ip_address" text,
	"provider_checkout_id" text,
	"provider_order_id" text,
	"provider_subscription_id" text,
	"last_error_message" text,
	"initiated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "meta_fbp" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "meta_fbc" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "last_user_agent" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "last_ip_address" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "meta_purchase_event_id" text;--> statement-breakpoint
ALTER TABLE "checkout_attributions" ADD CONSTRAINT "checkout_attributions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checkout_attributions" ADD CONSTRAINT "checkout_attributions_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "checkout_attributions_user_initiated_idx" ON "checkout_attributions" USING btree ("user_id","initiated_at");--> statement-breakpoint
CREATE INDEX "checkout_attributions_organization_idx" ON "checkout_attributions" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "checkout_attributions_status_idx" ON "checkout_attributions" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "checkout_attributions_initiate_event_unique" ON "checkout_attributions" USING btree ("initiate_checkout_event_id");--> statement-breakpoint
CREATE UNIQUE INDEX "checkout_attributions_purchase_event_unique" ON "checkout_attributions" USING btree ("purchase_event_id");