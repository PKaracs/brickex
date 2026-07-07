import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getProject, getProjectLatestOutputUrl } from "@/lib/actions/get-project";
import { getUserSubscription } from "@/lib/actions/get-user-subscription";
import { ProjectDashboard } from "@/components/dashboard/project-dashboard";
import DashboardLoading from "../loading";

interface ProjectPageProps {
  params: Promise<{
    project_id: string;
  }>;
  searchParams: Promise<{
    checkout?: string;
    auth?: string;
  }>;
}

async function ProjectContent({
  projectId,
  checkoutSuccess,
  authMethod,
}: {
  projectId: string;
  checkoutSuccess: boolean;
  authMethod?: string;
}) {
  const [projectResult, subscriptionResult] = await Promise.all([
    getProject(projectId),
    getUserSubscription(),
  ]);

  if ("error" in projectResult) {
    notFound();
  }

  const subscription =
    "error" in subscriptionResult ? null : subscriptionResult;
  const initialOutputUrl = await getProjectLatestOutputUrl(projectId);

  return (
    <ProjectDashboard
      projectId={projectResult.project.id}
      initialOutputUrl={initialOutputUrl}
      subscription={subscription}
      checkoutSuccess={checkoutSuccess}
      authMethod={authMethod}
      abVariant={null}
    />
  );
}

export default async function ProjectPage({
  params,
  searchParams,
}: ProjectPageProps) {
  const { project_id } = await params;
  const query = await searchParams;
  const checkoutSuccess = query.checkout === "success";
  const authMethod = query.auth;

  return (
    <Suspense fallback={<DashboardLoading />}>
      <ProjectContent
        projectId={project_id}
        checkoutSuccess={checkoutSuccess}
        authMethod={authMethod}
      />
    </Suspense>
  );
}
