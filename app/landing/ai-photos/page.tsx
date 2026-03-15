import { permanentRedirect } from "next/navigation";

export default function LegacyAIPhotosHubPage() {
  permanentRedirect("/ideas");
}
