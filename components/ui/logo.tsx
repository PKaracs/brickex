import Image from "next/image";
import { getPublicAssetUrl } from "@/lib/utils/storage";

interface LogoProps {
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
}

export function Logo({
  width = 48,
  height = 48,
  className,
  priority = false,
}: LogoProps) {
  return (
    <Image
      src={getPublicAssetUrl("logosvg.svg")}
      alt="Richflex Logo"
      width={width}
      height={height}
      className={className}
      priority={priority}
    />
  );
}


