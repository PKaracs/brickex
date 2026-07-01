import type { ReactNode } from "react";

type StaticRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  inView?: boolean;
};

export function StaticReveal({ children, className }: StaticRevealProps) {
  return <div className={className}>{children}</div>;
}
