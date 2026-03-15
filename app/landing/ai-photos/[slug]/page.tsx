import { permanentRedirect } from "next/navigation";

interface LegacyIdeaPageProps {
  params: Promise<{ slug: string }>;
}

export default async function LegacyAIPhotosDetailPage({
  params,
}: LegacyIdeaPageProps) {
  const { slug } = await params;
  permanentRedirect(`/ideas/${slug}`);
}
