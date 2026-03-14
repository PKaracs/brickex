import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getLatestProject, createProject } from "@/lib/actions/create-project";
import { getProjectLatestOutputUrl } from "@/lib/actions/get-project";
import { getUserSubscription } from "@/lib/actions/get-user-subscription";
import { ProjectDashboard } from "@/components/dashboard/project-dashboard";
import { getSession } from "@/lib/auth-session";
import DashboardLoading from "./loading";

interface DashboardPageProps {
  searchParams: Promise<{
    checkout?: string;
    auth?: string;
  }>;
}

async function DashboardContent({
  checkoutSuccess,
  authMethod,
}: {
  checkoutSuccess: boolean;
  authMethod?: string;
}) {
  const [projectResult, subscriptionResult] = await Promise.all([
    getLatestProject(),
    getUserSubscription(),
  ]);

  if ("error" in projectResult) {
    if ("noProject" in projectResult && projectResult.noProject) {
      const newProject = await createProject();
      if ("error" in newProject) redirect("/dashboard");
      redirect(`/dashboard/${newProject.projectId}`);
    }
    redirect("/dashboard");
  }

  const subscription =
    "error" in subscriptionResult ? null : subscriptionResult;
  const initialOutputUrl = await getProjectLatestOutputUrl(projectResult.project.id);

  return (
    <ProjectDashboard
      project={projectResult.project}
      initialOutputUrl={initialOutputUrl}
      replaceUrl
      subscription={subscription}
      checkoutSuccess={checkoutSuccess}
      authMethod={authMethod}
      abVariant={null}
    />
  );
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const session = await getSession();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const params = await searchParams;
  const checkoutSuccess = params.checkout === "success";
  const authMethod = params.auth;

  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardContent
        checkoutSuccess={checkoutSuccess}
        authMethod={authMethod}
      />
    </Suspense>
  );
}
