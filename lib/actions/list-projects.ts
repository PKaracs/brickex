"use server";

export async function listCompletedProjects(): Promise<
  { projects: any[] } | { error: string }
> {
  return { projects: [] };
}
