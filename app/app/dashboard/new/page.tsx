import { redirect } from "next/navigation";

import { createProject } from "@/lib/actions/create-project";

interface NewDashboardPageProps {
  searchParams: Promise<{
    checkout?: string;
  }>;
}

export default async function NewDashboardPage({ searchParams }: NewDashboardPageProps) {
  const query = await searchParams;
  const result = await createProject();

  if ("error" in result) {
    redirect("/gallery");
  }

  const checkoutQuery = query.checkout ? `?checkout=${encodeURIComponent(query.checkout)}` : "";
  redirect(`/dashboard/${result.projectId}${checkoutQuery}`);
}
