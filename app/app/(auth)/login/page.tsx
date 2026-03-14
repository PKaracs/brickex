import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth-session";
import { env } from "@/lib/env";

import LoginPageClient from "./login-client";

interface LoginPageProps {
  searchParams: Promise<{
    error?: string;
  }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await getSession();

  if (session?.user?.id) {
    redirect("/dashboard");
  }

  const params = await searchParams;

  return (
    <LoginPageClient
      authError={params.error}
      magicLinkEnabled={env.authEmailEnabled}
    />
  );
}
