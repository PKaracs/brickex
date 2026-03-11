import { Suspense } from "react";
import VideoLoading from "./loading";
import { VideoClient } from "./video-client";

export default function VideoPage() {
  return (
    <Suspense fallback={<VideoLoading />}>
      <VideoClient />
    </Suspense>
  );
}
