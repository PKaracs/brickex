import DashboardLoading from "../loading";
import { NewDashboardClient } from "./new-dashboard-client";

interface NewDashboardPageProps {
  searchParams: Promise<{
    checkout?: string;
  }>;
}

export default async function NewDashboardPage({
  searchParams,
}: NewDashboardPageProps) {
  const query = await searchParams;

  return (
    <NewDashboardClient
      checkout={query.checkout}
      fallback={<DashboardLoading />}
    />
  );
}
