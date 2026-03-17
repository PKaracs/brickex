import { redirect } from "next/navigation";

import { getSignupUrl } from "@/lib/app-url";

export default function WaitlistPage() {
  redirect(getSignupUrl());
}
