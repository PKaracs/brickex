import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth-session";

interface DashboardPageProps {
  searchParams: Promise<{
    checkout?: string;
  }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const session = await getSession();
  const query = await searchParams;

  if (!session?.user?.id) {
    redirect("/app/login");
  }

  const checkoutQuery = query.checkout ? `?checkout=${encodeURIComponent(query.checkout)}` : "";
  redirect(`/app/dashboard/new${checkoutQuery}`);
}
