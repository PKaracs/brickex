"use server";

import { eq, asc } from "drizzle-orm";

import * as schema from "@/db/schema";
import { db } from "@/lib/db";
import { requireAuthWithSession } from "@/lib/auth-guard";

export interface WorkspaceItem {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  isPlayground: boolean;
  createdAt: Date;
}

/**
 * Ensures every user has a permanent Playground workspace.
 * If the user's oldest org doesn't have isPlayground set,
 * migrates it (renames to "Playground", sets the flag).
 * Returns the full list of workspaces with the playground identified.
 */
export async function ensurePlaygroundAndListWorkspaces(): Promise<
  { workspaces: WorkspaceItem[]; playgroundId: string } | { error: string }
> {
  try {
    const session = await requireAuthWithSession();
    const userId = session.user.id;

    const memberships = await db.query.members.findMany({
      where: eq(schema.members.userId, userId),
      with: { organization: true },
      orderBy: (m) => [asc(m.createdAt)],
    });

    if (memberships.length === 0) {
      return { error: "No workspaces found" };
    }

    const orgs = memberships.map((m) => m.organization);

    let playgroundOrg = orgs.find((o) => {
      const meta = o.metadata as Record<string, unknown> | null;
      return meta?.isPlayground === true;
    });

    if (!playgroundOrg) {
      const oldest = orgs[0];
      await db
        .update(schema.organizations)
        .set({
          name: "Playground",
          metadata: {
            ...((oldest.metadata as Record<string, unknown>) ?? {}),
            isPlayground: true,
          },
          updatedAt: new Date(),
        })
        .where(eq(schema.organizations.id, oldest.id));

      playgroundOrg = { ...oldest, name: "Playground" };
    }

    const workspaces: WorkspaceItem[] = orgs.map((o) => ({
      id: o.id,
      name: o.id === playgroundOrg!.id ? "Playground" : o.name,
      slug: o.slug,
      logo: o.logo,
      isPlayground: o.id === playgroundOrg!.id,
      createdAt: o.createdAt,
    }));

    return { workspaces, playgroundId: playgroundOrg.id };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load workspaces";
    return { error: message };
  }
}

export async function createWorkspace(
  name: string,
): Promise<{ workspaceId: string } | { error: string }> {
  try {
    const session = await requireAuthWithSession();
    const userId = session.user.id;

    const slug = slugify(name) || "project";
    let finalSlug = slug;
    let suffix = 1;

    while (
      await db.query.organizations.findFirst({
        where: eq(schema.organizations.slug, finalSlug),
        columns: { id: true },
      })
    ) {
      suffix += 1;
      finalSlug = `${slug}-${suffix}`;
    }

    const [workspace] = await db
      .insert(schema.organizations)
      .values({
        name: name.trim(),
        slug: finalSlug,
        metadata: { isPlayground: false },
      })
      .returning();

    await db.insert(schema.members).values({
      organizationId: workspace.id,
      userId,
      role: "owner",
    });

    await db.insert(schema.workspaceSettings).values({
      organizationId: workspace.id,
      companyName: name.trim(),
      metadata: { onboardingState: "provisioned" },
    });

    return { workspaceId: workspace.id };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create workspace";
    return { error: message };
  }
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 48);
}
