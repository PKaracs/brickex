import { createId } from "@paralleldrive/cuid2";
import { relations, sql } from "drizzle-orm";
import {
  type AnyPgColumn,
  boolean,
  doublePrecision,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

const cuid = () => createId();
const now = () => new Date();

export const subscriptionProviderEnum = pgEnum("subscription_provider", [
  "polar",
  "stripe",
  "manual",
  "none",
]);

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "trialing",
  "active",
  "past_due",
  "canceled",
  "expired",
  "paused",
]);

export const projectStatusEnum = pgEnum("project_status", [
  "draft",
  "processing",
  "complete",
  "failed",
  "archived",
]);

export const projectSourceTypeEnum = pgEnum("project_source_type", [
  "upload",
  "remote_url",
  "model",
  "plan",
  "sketch",
]);

export const projectTypeEnum = pgEnum("project_type", [
  "residential",
  "commercial",
  "hospitality",
  "mixed_use",
  "interior",
  "masterplan",
  "landscape",
  "other",
]);

export const assetKindEnum = pgEnum("asset_kind", [
  "source_image",
  "source_video",
  "reference_image",
  "reference_video",
  "moodboard",
  "style_reference",
  "mask",
  "render_image",
  "render_video",
  "thumbnail",
  "document",
  "brand_asset",
  "logo",
  "export",
  "other",
]);

export const mediaTypeEnum = pgEnum("media_type", [
  "image",
  "video",
  "document",
  "audio",
  "model_3d",
  "archive",
  "other",
]);

export const assetOriginEnum = pgEnum("asset_origin", [
  "upload",
  "generation",
  "derived",
  "import",
  "external",
]);

export const assetStatusEnum = pgEnum("asset_status", [
  "pending_upload",
  "uploaded",
  "processing",
  "ready",
  "failed",
  "deleted",
]);

export const assetVisibilityEnum = pgEnum("asset_visibility", [
  "private",
  "workspace",
  "public",
]);

export const uploadSessionStatusEnum = pgEnum("upload_session_status", [
  "pending",
  "uploaded",
  "confirmed",
  "expired",
  "canceled",
]);

export const toolRunTypeEnum = pgEnum("tool_run_type", [
  "image_generation",
  "video_generation",
  "image_edit",
  "video_edit",
  "analysis",
  "export",
]);

export const toolRunStatusEnum = pgEnum("tool_run_status", [
  "queued",
  "running",
  "succeeded",
  "failed",
  "canceled",
]);

export const toolRunAssetRoleEnum = pgEnum("tool_run_asset_role", [
  "input",
  "reference",
  "style",
  "mask",
  "output",
  "thumbnail",
  "storyboard",
  "brand",
]);

export const deliverableTypeEnum = pgEnum("deliverable_type", [
  "hero_render",
  "gallery_render",
  "animation",
  "teaser_video",
  "social_clip",
  "brochure_asset",
  "floorplan",
  "other",
]);

export const deliverableStatusEnum = pgEnum("deliverable_status", [
  "draft",
  "review",
  "approved",
  "rejected",
  "published",
  "archived",
]);

export const usageEventTypeEnum = pgEnum("usage_event_type", [
  "credit_grant",
  "credit_spend",
  "credit_refund",
  "storage_upload",
  "render_generation",
  "video_generation",
  "seat_change",
]);

export const providerTypeEnum = pgEnum("provider_type", [
  "openai",
  "google",
  "kling",
  "xai",
  "manual",
  "system",
  "other",
]);

export const webhookStatusEnum = pgEnum("webhook_status", [
  "received",
  "processed",
  "failed",
  "ignored",
]);

export const checkoutAttributionStatusEnum = pgEnum(
  "checkout_attribution_status",
  ["initiated", "purchase_failed", "purchased"],
);

export const organizations = pgTable(
  "organizations",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => cuid()),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    logo: text("logo"),
    metadata: jsonb("metadata").$type<Record<string, unknown> | null>(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => now()),
  },
  (table) => ({
    slugUnique: uniqueIndex("organizations_slug_unique").on(table.slug),
  }),
);

export const users = pgTable(
  "users",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => cuid()),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified").notNull().default(false),
    name: text("name"),
    image: text("image"),
    username: text("username"),
    displayUsername: text("display_username"),
    twoFactorEnabled: boolean("two_factor_enabled").notNull().default(false),
    defaultOrganizationId: text("default_organization_id").references(
      () => organizations.id,
      {
        onDelete: "set null",
      },
    ),
    phoneNumber: text("phone_number"),
    marketingOptIn: boolean("marketing_opt_in").notNull().default(false),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true }),
    billingCustomerId: text("billing_customer_id"),
    subscriptionProvider: subscriptionProviderEnum("subscription_provider")
      .notNull()
      .default("none"),
    subscriptionPlan: text("subscription_plan"),
    subscriptionStatus: subscriptionStatusEnum("subscription_status"),
    subscriptionCurrentPeriodEnd: timestamp("subscription_current_period_end", {
      withTimezone: true,
    }),
    creationsUsed: integer("creations_used").notNull().default(0),
    creationsLimit: integer("creations_limit").notNull().default(100),
    creditsBalance: integer("credits_balance").notNull().default(0),
    metaFbp: text("meta_fbp"),
    metaFbc: text("meta_fbc"),
    lastUserAgent: text("last_user_agent"),
    lastIpAddress: text("last_ip_address"),
    metaPurchaseEventId: text("meta_purchase_event_id"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => now()),
  },
  (table) => ({
    usernameUnique: uniqueIndex("users_username_unique").on(table.username),
    defaultOrganizationIdx: index("users_default_organization_idx").on(
      table.defaultOrganizationId,
    ),
    billingCustomerIdx: index("users_billing_customer_idx").on(
      table.billingCustomerId,
    ),
  }),
);

export const sessions = pgTable(
  "sessions",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => cuid()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    token: text("token").notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    activeOrganizationId: text("active_organization_id").references(
      () => organizations.id,
      { onDelete: "set null" },
    ),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => now()),
  },
  (table) => ({
    userIdx: index("sessions_user_idx").on(table.userId),
    activeOrganizationIdx: index("sessions_active_organization_idx").on(
      table.activeOrganizationId,
    ),
  }),
);

export const accounts = pgTable(
  "accounts",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => cuid()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", {
      withTimezone: true,
    }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
      withTimezone: true,
    }),
    scope: text("scope"),
    password: text("password"),
    tokenType: text("token_type"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => now()),
  },
  (table) => ({
    userIdx: index("accounts_user_idx").on(table.userId),
    providerAccountUnique: uniqueIndex("accounts_provider_account_unique").on(
      table.providerId,
      table.accountId,
    ),
  }),
);

export const verifications = pgTable(
  "verifications",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => cuid()),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => now()),
  },
  (table) => ({
    identifierIdx: index("verifications_identifier_idx").on(table.identifier),
    identifierValueUnique: uniqueIndex(
      "verifications_identifier_value_unique",
    ).on(table.identifier, table.value),
  }),
);

export const members = pgTable(
  "members",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => cuid()),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: text("role").notNull().default("owner"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    organizationIdx: index("members_organization_idx").on(table.organizationId),
    userIdx: index("members_user_idx").on(table.userId),
    organizationUserUnique: uniqueIndex("members_organization_user_unique").on(
      table.organizationId,
      table.userId,
    ),
  }),
);

export const invitations = pgTable(
  "invitations",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => cuid()),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    role: text("role").notNull().default("member"),
    status: text("status").notNull().default("pending"),
    teamId: text("team_id"),
    inviterId: text("inviter_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    organizationIdx: index("invitations_organization_idx").on(
      table.organizationId,
    ),
    emailIdx: index("invitations_email_idx").on(table.email),
  }),
);

export const twoFactors = pgTable(
  "two_factors",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => cuid()),
    secret: text("secret").notNull(),
    backupCodes: text("backup_codes").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => now()),
  },
  (table) => ({
    userUnique: uniqueIndex("two_factors_user_unique").on(table.userId),
    secretIdx: index("two_factors_secret_idx").on(table.secret),
  }),
);

export const workspaceSettings = pgTable("workspace_settings", {
  organizationId: text("organization_id")
    .primaryKey()
    .references(() => organizations.id, { onDelete: "cascade" }),
  timezone: text("timezone").notNull().default("Europe/Madrid"),
  locale: text("locale").notNull().default("en"),
  companyName: text("company_name"),
  websiteUrl: text("website_url"),
  brandSummary: text("brand_summary"),
  brandVoice: text("brand_voice"),
  primaryColor: text("primary_color"),
  secondaryColor: text("secondary_color"),
  accentColor: text("accent_color"),
  defaultImageStyle: text("default_image_style"),
  defaultVideoStyle: text("default_video_style"),
  metadata: jsonb("metadata").$type<Record<string, unknown> | null>(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => now()),
});

export const subscriptions = pgTable(
  "subscriptions",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => cuid()),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    provider: subscriptionProviderEnum("provider").notNull().default("none"),
    providerCustomerId: text("provider_customer_id"),
    providerSubscriptionId: text("provider_subscription_id"),
    planCode: text("plan_code"),
    status: subscriptionStatusEnum("status").notNull().default("trialing"),
    currentPeriodStart: timestamp("current_period_start", {
      withTimezone: true,
    }),
    currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
    cancelAt: timestamp("cancel_at", { withTimezone: true }),
    trialEndsAt: timestamp("trial_ends_at", { withTimezone: true }),
    seats: integer("seats").notNull().default(1),
    metadata: jsonb("metadata").$type<Record<string, unknown> | null>(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => now()),
  },
  (table) => ({
    organizationUnique: uniqueIndex("subscriptions_organization_unique").on(
      table.organizationId,
    ),
    providerSubscriptionUnique: uniqueIndex(
      "subscriptions_provider_subscription_unique",
    ).on(table.provider, table.providerSubscriptionId),
  }),
);

export const projects = pgTable(
  "projects",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => cuid()),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    createdByUserId: text("created_by_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    updatedByUserId: text("updated_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    projectType: projectTypeEnum("project_type").notNull().default("other"),
    sourceType: projectSourceTypeEnum("source_type")
      .notNull()
      .default("upload"),
    status: projectStatusEnum("status").notNull().default("draft"),
    templateId: text("template_id"),
    customPrompt: text("custom_prompt"),
    settings: jsonb("settings").$type<Record<string, unknown> | null>(),
    addressLine1: text("address_line_1"),
    city: text("city"),
    region: text("region"),
    postalCode: text("postal_code"),
    countryCode: text("country_code"),
    latitude: doublePrecision("latitude"),
    longitude: doublePrecision("longitude"),
    heroAssetId: text("hero_asset_id").references(
      (): AnyPgColumn => assets.id,
      {
        onDelete: "set null",
      },
    ),
    latestRunId: text("latest_run_id").references(
      (): AnyPgColumn => toolRuns.id,
      {
        onDelete: "set null",
      },
    ),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => now()),
  },
  (table) => ({
    organizationSlugUnique: uniqueIndex("projects_organization_slug_unique").on(
      table.organizationId,
      table.slug,
    ),
    organizationStatusIdx: index("projects_organization_status_idx").on(
      table.organizationId,
      table.status,
    ),
    heroAssetIdx: index("projects_hero_asset_idx").on(table.heroAssetId),
    latestRunIdx: index("projects_latest_run_idx").on(table.latestRunId),
  }),
);

export const projectVersions = pgTable(
  "project_versions",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => cuid()),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    versionNumber: integer("version_number").notNull(),
    createdByUserId: text("created_by_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    label: text("label"),
    config: jsonb("config")
      .$type<Record<string, unknown>>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    prompt: text("prompt"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    projectVersionUnique: uniqueIndex(
      "project_versions_project_version_unique",
    ).on(table.projectId, table.versionNumber),
    projectIdx: index("project_versions_project_idx").on(table.projectId),
  }),
);

export const toolRuns = pgTable(
  "tool_runs",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => cuid()),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    createdByUserId: text("created_by_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    projectVersionId: text("project_version_id").references(
      () => projectVersions.id,
      { onDelete: "set null" },
    ),
    type: toolRunTypeEnum("type").notNull(),
    toolId: text("tool_id").notNull(),
    provider: providerTypeEnum("provider").notNull().default("system"),
    model: text("model"),
    status: toolRunStatusEnum("status").notNull().default("queued"),
    priority: integer("priority").notNull().default(0),
    idempotencyKey: text("idempotency_key"),
    providerRequestId: text("provider_request_id"),
    prompt: text("prompt"),
    negativePrompt: text("negative_prompt"),
    instructions: text("instructions"),
    settings: jsonb("settings").$type<Record<string, unknown> | null>(),
    errorCode: text("error_code"),
    errorMessage: text("error_message"),
    costUsd: numeric("cost_usd", { precision: 12, scale: 4 }),
    creditsConsumed: integer("credits_consumed").notNull().default(0),
    queuedAt: timestamp("queued_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    canceledAt: timestamp("canceled_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => now()),
  },
  (table) => ({
    projectStatusIdx: index("tool_runs_project_status_idx").on(
      table.projectId,
      table.status,
    ),
    organizationIdx: index("tool_runs_organization_idx").on(
      table.organizationId,
    ),
    providerRequestUnique: uniqueIndex("tool_runs_provider_request_unique").on(
      table.provider,
      table.providerRequestId,
    ),
    idempotencyUnique: uniqueIndex("tool_runs_idempotency_unique").on(
      table.idempotencyKey,
    ),
  }),
);

export const assets = pgTable(
  "assets",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => cuid()),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    projectId: text("project_id").references(() => projects.id, {
      onDelete: "cascade",
    }),
    createdByUserId: text("created_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    sourceAssetId: text("source_asset_id").references(
      (): AnyPgColumn => assets.id,
      {
        onDelete: "set null",
      },
    ),
    sourceRunId: text("source_run_id").references(() => toolRuns.id, {
      onDelete: "set null",
    }),
    bucket: text("bucket").notNull(),
    path: text("path").notNull(),
    assetKind: assetKindEnum("asset_kind").notNull(),
    mediaType: mediaTypeEnum("media_type").notNull(),
    origin: assetOriginEnum("origin").notNull(),
    status: assetStatusEnum("status").notNull().default("pending_upload"),
    visibility: assetVisibilityEnum("visibility").notNull().default("private"),
    originalFilename: text("original_filename"),
    contentType: text("content_type"),
    extension: text("extension"),
    byteSize: integer("byte_size"),
    checksumSha256: text("checksum_sha256"),
    width: integer("width"),
    height: integer("height"),
    durationMs: integer("duration_ms"),
    frameRate: numeric("frame_rate", { precision: 6, scale: 2 }),
    caption: text("caption"),
    altText: text("alt_text"),
    metadata: jsonb("metadata").$type<Record<string, unknown> | null>(),
    readyAt: timestamp("ready_at", { withTimezone: true }),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => now()),
  },
  (table) => ({
    storageObjectUnique: uniqueIndex("assets_storage_object_unique").on(
      table.bucket,
      table.path,
    ),
    projectKindIdx: index("assets_project_kind_idx").on(
      table.projectId,
      table.assetKind,
    ),
    organizationStatusIdx: index("assets_organization_status_idx").on(
      table.organizationId,
      table.status,
    ),
    sourceRunIdx: index("assets_source_run_idx").on(table.sourceRunId),
  }),
);

export const uploadSessions = pgTable(
  "upload_sessions",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => cuid()),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    assetId: text("asset_id")
      .notNull()
      .references(() => assets.id, { onDelete: "cascade" }),
    requestedByUserId: text("requested_by_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    bucket: text("bucket").notNull(),
    path: text("path").notNull(),
    contentType: text("content_type").notNull(),
    maxBytes: integer("max_bytes").notNull(),
    status: uploadSessionStatusEnum("status").notNull().default("pending"),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    uploadedAt: timestamp("uploaded_at", { withTimezone: true }),
    confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
    metadata: jsonb("metadata").$type<Record<string, unknown> | null>(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    assetUnique: uniqueIndex("upload_sessions_asset_unique").on(table.assetId),
    projectStatusIdx: index("upload_sessions_project_status_idx").on(
      table.projectId,
      table.status,
    ),
    expiresAtIdx: index("upload_sessions_expires_at_idx").on(table.expiresAt),
  }),
);

export const toolRunAttempts = pgTable(
  "tool_run_attempts",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => cuid()),
    toolRunId: text("tool_run_id")
      .notNull()
      .references(() => toolRuns.id, { onDelete: "cascade" }),
    attemptNumber: integer("attempt_number").notNull(),
    status: toolRunStatusEnum("status").notNull(),
    providerRequestId: text("provider_request_id"),
    requestPayload: jsonb("request_payload").$type<Record<
      string,
      unknown
    > | null>(),
    responsePayload: jsonb("response_payload").$type<Record<
      string,
      unknown
    > | null>(),
    errorMessage: text("error_message"),
    startedAt: timestamp("started_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    toolRunAttemptUnique: uniqueIndex(
      "tool_run_attempts_run_attempt_unique",
    ).on(table.toolRunId, table.attemptNumber),
  }),
);

export const toolRunAssets = pgTable(
  "tool_run_assets",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => cuid()),
    toolRunId: text("tool_run_id")
      .notNull()
      .references(() => toolRuns.id, { onDelete: "cascade" }),
    assetId: text("asset_id")
      .notNull()
      .references(() => assets.id, { onDelete: "cascade" }),
    role: toolRunAssetRoleEnum("role").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    metadata: jsonb("metadata").$type<Record<string, unknown> | null>(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    runRoleIdx: index("tool_run_assets_run_role_idx").on(
      table.toolRunId,
      table.role,
    ),
    runAssetRoleUnique: uniqueIndex("tool_run_assets_run_asset_role_unique").on(
      table.toolRunId,
      table.assetId,
      table.role,
    ),
  }),
);

export const deliverables = pgTable(
  "deliverables",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => cuid()),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    assetId: text("asset_id")
      .notNull()
      .references(() => assets.id, { onDelete: "cascade" }),
    toolRunId: text("tool_run_id").references(() => toolRuns.id, {
      onDelete: "set null",
    }),
    type: deliverableTypeEnum("type").notNull(),
    status: deliverableStatusEnum("status").notNull().default("draft"),
    title: text("title").notNull(),
    description: text("description"),
    publishedUrl: text("published_url"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    sortOrder: integer("sort_order").notNull().default(0),
    metadata: jsonb("metadata").$type<Record<string, unknown> | null>(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => now()),
  },
  (table) => ({
    projectStatusIdx: index("deliverables_project_status_idx").on(
      table.projectId,
      table.status,
    ),
    assetUnique: uniqueIndex("deliverables_asset_unique").on(table.assetId),
  }),
);

export const usageLedger = pgTable(
  "usage_ledger",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => cuid()),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    userId: text("user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    subscriptionId: text("subscription_id").references(() => subscriptions.id, {
      onDelete: "set null",
    }),
    projectId: text("project_id").references(() => projects.id, {
      onDelete: "set null",
    }),
    toolRunId: text("tool_run_id").references(() => toolRuns.id, {
      onDelete: "set null",
    }),
    eventType: usageEventTypeEnum("event_type").notNull(),
    quantity: integer("quantity").notNull(),
    unit: text("unit").notNull().default("credits"),
    balanceAfter: integer("balance_after"),
    notes: text("notes"),
    metadata: jsonb("metadata").$type<Record<string, unknown> | null>(),
    occurredAt: timestamp("occurred_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    organizationOccurredIdx: index("usage_ledger_organization_occurred_idx").on(
      table.organizationId,
      table.occurredAt,
    ),
    userOccurredIdx: index("usage_ledger_user_occurred_idx").on(
      table.userId,
      table.occurredAt,
    ),
  }),
);

export const checkoutAttributions = pgTable(
  "checkout_attributions",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => cuid()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    organizationId: text("organization_id").references(() => organizations.id, {
      onDelete: "set null",
    }),
    provider: subscriptionProviderEnum("provider").notNull().default("polar"),
    status: checkoutAttributionStatusEnum("status")
      .notNull()
      .default("initiated"),
    planCode: text("plan_code").notNull(),
    source: text("source"),
    initiateCheckoutEventId: text("initiate_checkout_event_id").notNull(),
    purchaseEventId: text("purchase_event_id").notNull(),
    checkoutValue: numeric("checkout_value", {
      precision: 10,
      scale: 2,
    }).notNull(),
    currency: text("currency").notNull().default("USD"),
    metaFbp: text("meta_fbp"),
    metaFbc: text("meta_fbc"),
    clientUserAgent: text("client_user_agent"),
    clientIpAddress: text("client_ip_address"),
    providerCheckoutId: text("provider_checkout_id"),
    providerOrderId: text("provider_order_id"),
    providerSubscriptionId: text("provider_subscription_id"),
    lastErrorMessage: text("last_error_message"),
    initiatedAt: timestamp("initiated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => now()),
  },
  (table) => ({
    userInitiatedIdx: index("checkout_attributions_user_initiated_idx").on(
      table.userId,
      table.initiatedAt,
    ),
    organizationIdx: index("checkout_attributions_organization_idx").on(
      table.organizationId,
    ),
    statusIdx: index("checkout_attributions_status_idx").on(table.status),
    initiateEventUnique: uniqueIndex(
      "checkout_attributions_initiate_event_unique",
    ).on(table.initiateCheckoutEventId),
    purchaseEventUnique: uniqueIndex(
      "checkout_attributions_purchase_event_unique",
    ).on(table.purchaseEventId),
  }),
);

export const webhookEvents = pgTable(
  "webhook_events",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => cuid()),
    provider: providerTypeEnum("provider").notNull(),
    externalEventId: text("external_event_id").notNull(),
    eventType: text("event_type"),
    status: webhookStatusEnum("status").notNull().default("received"),
    payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
    errorMessage: text("error_message"),
    receivedAt: timestamp("received_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    processedAt: timestamp("processed_at", { withTimezone: true }),
  },
  (table) => ({
    providerEventUnique: uniqueIndex("webhook_events_provider_event_unique").on(
      table.provider,
      table.externalEventId,
    ),
    statusIdx: index("webhook_events_status_idx").on(table.status),
  }),
);

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => cuid()),
    organizationId: text("organization_id").references(() => organizations.id, {
      onDelete: "set null",
    }),
    actorUserId: text("actor_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id").notNull(),
    action: text("action").notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    payload: jsonb("payload").$type<Record<string, unknown> | null>(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    entityIdx: index("audit_logs_entity_idx").on(
      table.entityType,
      table.entityId,
    ),
    organizationIdx: index("audit_logs_organization_idx").on(
      table.organizationId,
    ),
  }),
);

export const usersRelations = relations(users, ({ many, one }) => ({
  defaultOrganization: one(organizations, {
    fields: [users.defaultOrganizationId],
    references: [organizations.id],
  }),
  sessions: many(sessions),
  accounts: many(accounts),
  memberships: many(members),
  invitationsSent: many(invitations),
  projectsCreated: many(projects, { relationName: "projects_created_by" }),
  projectsUpdated: many(projects, { relationName: "projects_updated_by" }),
  projectVersions: many(projectVersions),
  assets: many(assets),
  toolRuns: many(toolRuns),
  usageEntries: many(usageLedger),
  checkoutAttributions: many(checkoutAttributions),
  auditLogs: many(auditLogs),
  twoFactor: one(twoFactors),
}));

export const organizationsRelations = relations(
  organizations,
  ({ many, one }) => ({
    settings: one(workspaceSettings),
    members: many(members),
    invitations: many(invitations),
    projects: many(projects),
    assets: many(assets),
    toolRuns: many(toolRuns),
    subscription: one(subscriptions),
    usageEntries: many(usageLedger),
    checkoutAttributions: many(checkoutAttributions),
    deliverables: many(deliverables),
    auditLogs: many(auditLogs),
  }),
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
  activeOrganization: one(organizations, {
    fields: [sessions.activeOrganizationId],
    references: [organizations.id],
  }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const membersRelations = relations(members, ({ one }) => ({
  organization: one(organizations, {
    fields: [members.organizationId],
    references: [organizations.id],
  }),
  user: one(users, {
    fields: [members.userId],
    references: [users.id],
  }),
}));

export const invitationsRelations = relations(invitations, ({ one }) => ({
  organization: one(organizations, {
    fields: [invitations.organizationId],
    references: [organizations.id],
  }),
  inviter: one(users, {
    fields: [invitations.inviterId],
    references: [users.id],
  }),
}));

export const twoFactorsRelations = relations(twoFactors, ({ one }) => ({
  user: one(users, {
    fields: [twoFactors.userId],
    references: [users.id],
  }),
}));

export const workspaceSettingsRelations = relations(
  workspaceSettings,
  ({ one }) => ({
    organization: one(organizations, {
      fields: [workspaceSettings.organizationId],
      references: [organizations.id],
    }),
  }),
);

export const subscriptionsRelations = relations(
  subscriptions,
  ({ one, many }) => ({
    organization: one(organizations, {
      fields: [subscriptions.organizationId],
      references: [organizations.id],
    }),
    usageEntries: many(usageLedger),
  }),
);

export const projectsRelations = relations(projects, ({ many, one }) => ({
  organization: one(organizations, {
    fields: [projects.organizationId],
    references: [organizations.id],
  }),
  createdBy: one(users, {
    relationName: "projects_created_by",
    fields: [projects.createdByUserId],
    references: [users.id],
  }),
  updatedBy: one(users, {
    relationName: "projects_updated_by",
    fields: [projects.updatedByUserId],
    references: [users.id],
  }),
  heroAsset: one(assets, {
    fields: [projects.heroAssetId],
    references: [assets.id],
  }),
  latestRun: one(toolRuns, {
    fields: [projects.latestRunId],
    references: [toolRuns.id],
  }),
  versions: many(projectVersions),
  assets: many(assets),
  toolRuns: many(toolRuns),
  uploadSessions: many(uploadSessions),
  deliverables: many(deliverables),
  usageEntries: many(usageLedger),
}));

export const projectVersionsRelations = relations(
  projectVersions,
  ({ many, one }) => ({
    project: one(projects, {
      fields: [projectVersions.projectId],
      references: [projects.id],
    }),
    createdBy: one(users, {
      fields: [projectVersions.createdByUserId],
      references: [users.id],
    }),
    toolRuns: many(toolRuns),
  }),
);

export const assetsRelations = relations(assets, ({ many, one }) => ({
  organization: one(organizations, {
    fields: [assets.organizationId],
    references: [organizations.id],
  }),
  project: one(projects, {
    fields: [assets.projectId],
    references: [projects.id],
  }),
  createdBy: one(users, {
    fields: [assets.createdByUserId],
    references: [users.id],
  }),
  sourceAsset: one(assets, {
    fields: [assets.sourceAssetId],
    references: [assets.id],
    relationName: "asset_derivation",
  }),
  derivedAssets: many(assets, { relationName: "asset_derivation" }),
  sourceRun: one(toolRuns, {
    fields: [assets.sourceRunId],
    references: [toolRuns.id],
  }),
  uploadSession: one(uploadSessions),
  toolRunLinks: many(toolRunAssets),
  deliverable: one(deliverables),
}));

export const uploadSessionsRelations = relations(uploadSessions, ({ one }) => ({
  organization: one(organizations, {
    fields: [uploadSessions.organizationId],
    references: [organizations.id],
  }),
  project: one(projects, {
    fields: [uploadSessions.projectId],
    references: [projects.id],
  }),
  asset: one(assets, {
    fields: [uploadSessions.assetId],
    references: [assets.id],
  }),
  requestedBy: one(users, {
    fields: [uploadSessions.requestedByUserId],
    references: [users.id],
  }),
}));

export const toolRunsRelations = relations(toolRuns, ({ many, one }) => ({
  organization: one(organizations, {
    fields: [toolRuns.organizationId],
    references: [organizations.id],
  }),
  project: one(projects, {
    fields: [toolRuns.projectId],
    references: [projects.id],
  }),
  createdBy: one(users, {
    fields: [toolRuns.createdByUserId],
    references: [users.id],
  }),
  projectVersion: one(projectVersions, {
    fields: [toolRuns.projectVersionId],
    references: [projectVersions.id],
  }),
  assets: many(toolRunAssets),
  attempts: many(toolRunAttempts),
  outputs: many(assets),
  deliverables: many(deliverables),
  usageEntries: many(usageLedger),
}));

export const toolRunAttemptsRelations = relations(
  toolRunAttempts,
  ({ one }) => ({
    toolRun: one(toolRuns, {
      fields: [toolRunAttempts.toolRunId],
      references: [toolRuns.id],
    }),
  }),
);

export const toolRunAssetsRelations = relations(toolRunAssets, ({ one }) => ({
  toolRun: one(toolRuns, {
    fields: [toolRunAssets.toolRunId],
    references: [toolRuns.id],
  }),
  asset: one(assets, {
    fields: [toolRunAssets.assetId],
    references: [assets.id],
  }),
}));

export const deliverablesRelations = relations(deliverables, ({ one }) => ({
  organization: one(organizations, {
    fields: [deliverables.organizationId],
    references: [organizations.id],
  }),
  project: one(projects, {
    fields: [deliverables.projectId],
    references: [projects.id],
  }),
  asset: one(assets, {
    fields: [deliverables.assetId],
    references: [assets.id],
  }),
  toolRun: one(toolRuns, {
    fields: [deliverables.toolRunId],
    references: [toolRuns.id],
  }),
}));

export const usageLedgerRelations = relations(usageLedger, ({ one }) => ({
  organization: one(organizations, {
    fields: [usageLedger.organizationId],
    references: [organizations.id],
  }),
  user: one(users, {
    fields: [usageLedger.userId],
    references: [users.id],
  }),
  subscription: one(subscriptions, {
    fields: [usageLedger.subscriptionId],
    references: [subscriptions.id],
  }),
  project: one(projects, {
    fields: [usageLedger.projectId],
    references: [projects.id],
  }),
  toolRun: one(toolRuns, {
    fields: [usageLedger.toolRunId],
    references: [toolRuns.id],
  }),
}));

export const checkoutAttributionsRelations = relations(
  checkoutAttributions,
  ({ one }) => ({
    user: one(users, {
      fields: [checkoutAttributions.userId],
      references: [users.id],
    }),
    organization: one(organizations, {
      fields: [checkoutAttributions.organizationId],
      references: [organizations.id],
    }),
  }),
);

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  organization: one(organizations, {
    fields: [auditLogs.organizationId],
    references: [organizations.id],
  }),
  actor: one(users, {
    fields: [auditLogs.actorUserId],
    references: [users.id],
  }),
}));

export const workspaces = organizations;
export const workspaceMembers = members;

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type Account = typeof accounts.$inferSelect;
export type Verification = typeof verifications.$inferSelect;
export type Organization = typeof organizations.$inferSelect;
export type Workspace = typeof organizations.$inferSelect;
export type Member = typeof members.$inferSelect;
export type Invitation = typeof invitations.$inferSelect;
export type TwoFactor = typeof twoFactors.$inferSelect;
export type WorkspaceSettings = typeof workspaceSettings.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type ProjectVersion = typeof projectVersions.$inferSelect;
export type Asset = typeof assets.$inferSelect;
export type NewAsset = typeof assets.$inferInsert;
export type UploadSession = typeof uploadSessions.$inferSelect;
export type ToolRun = typeof toolRuns.$inferSelect;
export type NewToolRun = typeof toolRuns.$inferInsert;
export type ToolRunAttempt = typeof toolRunAttempts.$inferSelect;
export type ToolRunAsset = typeof toolRunAssets.$inferSelect;
export type Deliverable = typeof deliverables.$inferSelect;
export type UsageLedgerEntry = typeof usageLedger.$inferSelect;
export type CheckoutAttribution = typeof checkoutAttributions.$inferSelect;
export type WebhookEvent = typeof webhookEvents.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;
