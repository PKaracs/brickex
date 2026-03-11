import {
  pgTable,
  text,
  timestamp,
  boolean,
  json,
  pgEnum,
  integer,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";

// Helper function to generate cuid
const cuid = () => createId();

/* ------------------------------------------------------------------ */
/* Enums                                                              */
/* ------------------------------------------------------------------ */

export const projectSourceTypeEnum = pgEnum("project_source_type", [
  "avatar",
  "upload",
]);

export const projectStatusEnum = pgEnum("project_status", [
  "draft",
  "processing",
  "complete",
  "failed",
]);

export const generationStatusEnum = pgEnum("generation_status", [
  "queued",
  "running",
  "succeeded",
  "failed",
]);

/* ------------------------------------------------------------------ */
/* Users + Polar + Better Auth                                        */
/* ------------------------------------------------------------------ */

// User table
export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => cuid()),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  name: text("name"),
  image: text("image"),
  hashedPassword: text("hashed_password"), // nullable for OAuth users
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  // Polar subscription fields
  polarCustomerId: text("polar_customer_id"),
  subscriptionId: text("subscription_id"),
  subscriptionProductId: text("subscription_product_id"), // Polar product ID to differentiate plans
  subscriptionStatus: text("subscription_status"), // "active" | "canceled" | "past_due" | null
  subscriptionCurrentPeriodEnd: timestamp("subscription_current_period_end", {
    withTimezone: true,
  }),
  // Creation tracking
  creationsUsed: integer("creations_used").notNull().default(0),
  creationsResetAt: timestamp("creations_reset_at", { withTimezone: true }),
  // Meta CAPI tracking (for improved match quality)
  metaFbp: text("meta_fbp"), // _fbp cookie - Facebook browser ID
  metaFbc: text("meta_fbc"), // _fbc cookie - Facebook click ID (from ad clicks)
  lastUserAgent: text("last_user_agent"), // Browser user agent for CAPI
  lastIpAddress: text("last_ip_address"), // IP address for CAPI match quality
  metaPurchaseEventId: text("meta_purchase_event_id"), // For Purchase event dedup (set at checkout, used in webhook)
  // Cached total flex worth (sum of all earnings - images + game)
  totalFlexWorth: text("total_flex_worth").default("0"),
  // A/B test variant for pricing page experiment
  // 'A' = control (1 free generation, then subscription modal)
  // 'B' = test (immediate pricing page, no free generation)
  // null = existing user before test (excluded from test)
  abVariant: text("ab_variant"),
});

// Better-auth tables
export const sessions = pgTable("sessions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => cuid()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  token: text("token").notNull().unique(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const accounts = pgTable("accounts", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => cuid()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(), // "credential" | "google" | "github" | etc.
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  accessTokenExpiresAt: timestamp("access_token_expires_at", {
    withTimezone: true,
  }),
  scope: text("scope"), // OAuth scope
  password: text("password"), // hashed password for credential provider
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const verifications = pgTable("verifications", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => cuid()),
  identifier: text("identifier").notNull(), // email or phone
  value: text("value").notNull(), // verification code/token
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/* ------------------------------------------------------------------ */
/* Avatars (onboarding selfie set)                                    */
/* ------------------------------------------------------------------ */

export const avatars = pgTable("avatars", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => cuid()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name"), // optional label if you add multiple avatars later
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const avatarImages = pgTable("avatar_images", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => cuid()),
  avatarId: text("avatar_id")
    .notNull()
    .references(() => avatars.id, { onDelete: "cascade" }),
  storageKey: text("storage_key").notNull(), // path in bucket
  metadata: json("metadata"), // width/height/etc (optional)
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/* ------------------------------------------------------------------ */
/* Projects (what user sets up in the UI)                             */
/* ------------------------------------------------------------------ */

export const projects = pgTable("projects", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => cuid()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title"), // Project title (optional)
  sourceType: projectSourceTypeEnum("source_type").notNull(), // "avatar" | "upload"
  templateId: text("template_id"), // ID from constants (no FK)
  status: projectStatusEnum("status").notNull().default("draft"),
  advancedSettings: json("advanced_settings"), // frameSize, shotType, sceneType, fitStyle, etc. (optional)
  customPrompt: text("custom_prompt"), // user's extra text (optional)
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Project-specific selfie uploads (when user chooses "Upload Selfies")
export const projectInputImages = pgTable("project_input_images", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => cuid()),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  storageKey: text("storage_key").notNull(),
  metadata: json("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Objects selected for a project (references constants by ID/name)
export const projectObjects = pgTable("project_objects", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => cuid()),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  objectId: text("object_id"), // ID from constants (no FK)
  objectType: text("object_type"), // "car" | "watch" | etc.
  objectName: text("object_name"), // "Ferrari SF90 Stradale"
  settings: json("settings"), // per-object tweaks (color, etc.)
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/* ------------------------------------------------------------------ */
/* Generations (each time user hits Generate)                         */
/* ------------------------------------------------------------------ */

export const projectGenerations = pgTable("project_generations", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => cuid()),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  status: generationStatusEnum("status").notNull().default("queued"),
  finalPrompt: text("final_prompt"), // what you send to NanoBanana
  inputImages: json("input_images"), // array of storageKeys actually sent
  modelParams: json("model_params"), // steps, cfg, etc. if needed
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});

// Outputs from NanoBanana for a specific generation
export const projectOutputs = pgTable("project_outputs", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => cuid()),
  projectGenerationId: text("project_generation_id")
    .notNull()
    .references(() => projectGenerations.id, { onDelete: "cascade" }),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  storageKey: text("storage_key").notNull(),
  thumbnailKey: text("thumbnail_key"),
  metadata: json("metadata"),
  // Flex worth data
  flexWorth: text("flex_worth"), // Total flex value as string (to avoid integer overflow)
  flexBreakdown: json("flex_breakdown"), // { outfit: 12500, watch: 45000, location: 8500, vehicle: 285000, accessories: 3200 }
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/* ------------------------------------------------------------------ */
/* Relations                                                          */
/* ------------------------------------------------------------------ */

export const usersRelations = relations(users, ({ many, one }) => ({
  avatars: many(avatars),
  projects: many(projects),
  sessions: many(sessions),
  accounts: many(accounts),
  abandonedCheckouts: many(abandonedCheckouts),
  onboarding: one(userOnboarding),
  onboardingProfile: one(userOnboardingProfile),
}));

export const avatarsRelations = relations(avatars, ({ one, many }) => ({
  user: one(users, {
    fields: [avatars.userId],
    references: [users.id],
  }),
  images: many(avatarImages),
}));

export const avatarImagesRelations = relations(avatarImages, ({ one }) => ({
  avatar: one(avatars, {
    fields: [avatarImages.avatarId],
    references: [avatars.id],
  }),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  user: one(users, {
    fields: [projects.userId],
    references: [users.id],
  }),
  inputImages: many(projectInputImages),
  objects: many(projectObjects),
  generations: many(projectGenerations),
  outputs: many(projectOutputs),
}));

export const projectInputImagesRelations = relations(
  projectInputImages,
  ({ one }) => ({
    project: one(projects, {
      fields: [projectInputImages.projectId],
      references: [projects.id],
    }),
  })
);

export const projectObjectsRelations = relations(projectObjects, ({ one }) => ({
  project: one(projects, {
    fields: [projectObjects.projectId],
    references: [projects.id],
  }),
}));

export const projectGenerationsRelations = relations(
  projectGenerations,
  ({ one, many }) => ({
    project: one(projects, {
      fields: [projectGenerations.projectId],
      references: [projects.id],
    }),
    outputs: many(projectOutputs),
  })
);

export const projectOutputsRelations = relations(projectOutputs, ({ one }) => ({
  generation: one(projectGenerations, {
    fields: [projectOutputs.projectGenerationId],
    references: [projectGenerations.id],
  }),
  project: one(projects, {
    fields: [projectOutputs.projectId],
    references: [projects.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

/* ------------------------------------------------------------------ */
/* Abandoned Checkouts (email recovery)                               */
/* ------------------------------------------------------------------ */

export const abandonedCheckouts = pgTable("abandoned_checkouts", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => cuid()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  productId: text("product_id"), // Polar product ID
  checkoutUrl: text("checkout_url"), // URL they were sent to
  email1SentAt: timestamp("email1_sent_at", { withTimezone: true }), // ~1 hour - "You didn't finish"
  email2SentAt: timestamp("email2_sent_at", { withTimezone: true }), // ~22 hours - "This is the part people underestimate"
  email3SentAt: timestamp("email3_sent_at", { withTimezone: true }), // ~72 hours - "I won't follow up again" + discount
  convertedAt: timestamp("converted_at", { withTimezone: true }), // When they completed purchase
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const abandonedCheckoutsRelations = relations(
  abandonedCheckouts,
  ({ one }) => ({
    user: one(users, {
      fields: [abandonedCheckouts.userId],
      references: [users.id],
    }),
  })
);

/* ------------------------------------------------------------------ */
/* Rate Limiting                                                      */
/* ------------------------------------------------------------------ */

export const rateLimits = pgTable("rate_limits", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => cuid()),
  key: text("key").notNull(), // e.g. "magic-link:ip:192.168.1.1" or "magic-link:email:user@example.com"
  count: integer("count").notNull().default(1),
  windowStart: timestamp("window_start", { withTimezone: true })
    .notNull()
    .defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});

export const authChallenges = pgTable("auth_challenges", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => cuid()),
  ip: text("ip").notNull().unique(),
  failureCount: integer("failure_count").notNull().default(1),
  challengedUntil: timestamp("challenged_until", { withTimezone: true }),
  lastFailureAt: timestamp("last_failure_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/* ------------------------------------------------------------------ */
/* Type exports                                                       */
/* ------------------------------------------------------------------ */

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Avatar = typeof avatars.$inferSelect;
export type NewAvatar = typeof avatars.$inferInsert;

export type AvatarImage = typeof avatarImages.$inferSelect;
export type NewAvatarImage = typeof avatarImages.$inferInsert;

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;

export type ProjectInputImage = typeof projectInputImages.$inferSelect;
export type NewProjectInputImage = typeof projectInputImages.$inferInsert;

export type ProjectObject = typeof projectObjects.$inferSelect;
export type NewProjectObject = typeof projectObjects.$inferInsert;

export type ProjectGeneration = typeof projectGenerations.$inferSelect;
export type NewProjectGeneration = typeof projectGenerations.$inferInsert;

export type ProjectOutput = typeof projectOutputs.$inferSelect;
export type NewProjectOutput = typeof projectOutputs.$inferInsert;

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;

export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;

export type Verification = typeof verifications.$inferSelect;
export type NewVerification = typeof verifications.$inferInsert;

export type RateLimit = typeof rateLimits.$inferSelect;
export type NewRateLimit = typeof rateLimits.$inferInsert;

export type AuthChallenge = typeof authChallenges.$inferSelect;
export type NewAuthChallenge = typeof authChallenges.$inferInsert;

export type AbandonedCheckout = typeof abandonedCheckouts.$inferSelect;
export type NewAbandonedCheckout = typeof abandonedCheckouts.$inferInsert;

/* ------------------------------------------------------------------ */
/* Email Unsubscribes                                                 */
/* ------------------------------------------------------------------ */

export const emailUnsubscribes = pgTable("email_unsubscribes", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => cuid()),
  email: text("email").notNull().unique(),
  userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
  reason: text("reason"),
  unsubscribedAt: timestamp("unsubscribed_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type EmailUnsubscribe = typeof emailUnsubscribes.$inferSelect;
export type NewEmailUnsubscribe = typeof emailUnsubscribes.$inferInsert;

/* ------------------------------------------------------------------ */
/* User Onboarding                                                    */
/* ------------------------------------------------------------------ */

export const userOnboarding = pgTable("user_onboarding", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => cuid()),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  currentStage: integer("current_stage").notNull().default(0), // 0-4 (5 emails)
  email0SentAt: timestamp("email0_sent_at", { withTimezone: true }),
  email1SentAt: timestamp("email1_sent_at", { withTimezone: true }),
  email2SentAt: timestamp("email2_sent_at", { withTimezone: true }),
  email3SentAt: timestamp("email3_sent_at", { withTimezone: true }),
  email4SentAt: timestamp("email4_sent_at", { withTimezone: true }),
  pausedAt: timestamp("paused_at", { withTimezone: true }), // Set when checkout initiated
  completedAt: timestamp("completed_at", { withTimezone: true }), // Set when purchased or flow done
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const userOnboardingRelations = relations(userOnboarding, ({ one }) => ({
  user: one(users, {
    fields: [userOnboarding.userId],
    references: [users.id],
  }),
}));

export type UserOnboarding = typeof userOnboarding.$inferSelect;
export type NewUserOnboarding = typeof userOnboarding.$inferInsert;

/* ------------------------------------------------------------------ */
/* Game Earnings (timestamped for leaderboard filtering)              */
/* ------------------------------------------------------------------ */

export const gameEarnings = pgTable("game_earnings", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => cuid()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  amount: text("amount").notNull(), // Stored as text to match flex_worth pattern
  source: text("source").default("flex_game"), // 'flex_game', 'bonus', etc.
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const gameEarningsRelations = relations(gameEarnings, ({ one }) => ({
  user: one(users, {
    fields: [gameEarnings.userId],
    references: [users.id],
  }),
}));

export type GameEarning = typeof gameEarnings.$inferSelect;
export type NewGameEarning = typeof gameEarnings.$inferInsert;

/* ------------------------------------------------------------------ */
/* Generation Rate Limits (persistent IP/fingerprint tracking)        */
/* ------------------------------------------------------------------ */

export const generationRateLimits = pgTable("generation_rate_limits", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => cuid()),
  ipAddress: text("ip_address").notNull(),
  fingerprint: text("fingerprint"), // Client-side fingerprint hash (optional)
  userAgentHash: text("user_agent_hash"), // SHA256 hash of user agent
  generationCount: integer("generation_count").notNull().default(1),
  firstGenerationAt: timestamp("first_generation_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  lastGenerationAt: timestamp("last_generation_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  windowExpiresAt: timestamp("window_expires_at", {
    withTimezone: true,
  }).notNull(),
  userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const generationRateLimitsRelations = relations(
  generationRateLimits,
  ({ one }) => ({
    user: one(users, {
      fields: [generationRateLimits.userId],
      references: [users.id],
    }),
  })
);

export type GenerationRateLimit = typeof generationRateLimits.$inferSelect;
export type NewGenerationRateLimit = typeof generationRateLimits.$inferInsert;

/* ------------------------------------------------------------------ */
/* User Onboarding Profile (in-app welcome flow)                      */
/* ------------------------------------------------------------------ */

export const userOnboardingProfile = pgTable("user_onboarding_profile", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => cuid()),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  goal: text("goal"), // 'flex_harder' | 'look_wealthier' | 'impress_everyone' | 'just_exploring'
  contentTypes: json("content_types").$type<string[]>(), // e.g. ['dating', 'instagram', 'business']
  creatorType: text("creator_type"), // 'myself' | 'ai_character'
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const userOnboardingProfileRelations = relations(
  userOnboardingProfile,
  ({ one }) => ({
    user: one(users, {
      fields: [userOnboardingProfile.userId],
      references: [users.id],
    }),
  })
);

export type UserOnboardingProfile = typeof userOnboardingProfile.$inferSelect;
export type NewUserOnboardingProfile = typeof userOnboardingProfile.$inferInsert;
