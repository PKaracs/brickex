"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface Heading {
  id: string;
  text: string;
  level: number;
}

interface BlogTableOfContentsProps {
  className?: string;
  variant?: "sidebar" | "inline";
  headings?: Heading[];
}

export default function BlogTableOfContents({
  className,
  variant = "sidebar",
  headings: initialHeadings = [],
}: BlogTableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");
  const headings = initialHeadings;

  useEffect(() => {
    if (headings.length === 0) return;

    // Set up intersection observer for active heading
    const headingElements = headings
      .map((h) => document.getElementById(h.id))
      .filter(Boolean) as HTMLElement[];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-20% 0% -35% 0%",
        threshold: 0,
      }
    );

    headingElements.forEach((el) => observer.observe(el));

    return () => {
      headingElements.forEach((el) => observer.unobserve(el));
    };
  }, [headings]);

  if (headings.length === 0) {
    return null;
  }

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, headingId: string) => {
    e.preventDefault();
    const element = document.getElementById(headingId);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  // Truncate long headings
  const truncateText = (text: string, maxLength: number = 40) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + "...";
  };

  if (variant === "inline") {
    return (
      <nav
        className={cn(
          "mb-8 rounded-xl border border-gray-100 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 p-5 shadow-sm",
          className
        )}
        aria-label="Table of contents"
      >
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
          On this page
        </h2>
        <ul className="space-y-1.5">
          {headings.slice(0, 8).map((heading, idx) => (
            <li key={heading.id} className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-400">{idx + 1}.</span>
              <Link
                href={`#${heading.id}`}
                className={cn(
                  "text-sm transition-all hover:text-blue-600",
                  activeId === heading.id
                    ? "text-blue-600 font-medium"
                    : "text-gray-700"
                )}
                onClick={(e) => handleClick(e, heading.id)}
              >
                {truncateText(heading.text, 50)}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    );
  }

  return (
    <aside
      className={cn(
        "sticky top-24 hidden xl:block w-56 shrink-0",
        className
      )}
      aria-label="Table of contents"
    >
      <nav className="rounded-xl border border-gray-100 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 p-4 shadow-sm">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
          On this page
        </h2>
        <ul className="space-y-1">
          {headings.slice(0, 10).map((heading, idx) => (
            <li key={heading.id} className="group">
              <Link
                href={`#${heading.id}`}
                className={cn(
                  "flex items-start gap-2 py-1 text-[13px] leading-snug transition-all hover:text-blue-600",
                  activeId === heading.id
                    ? "text-blue-600 font-medium"
                    : "text-gray-600"
                )}
                onClick={(e) => handleClick(e, heading.id)}
              >
                <span className={cn(
                  "mt-0.5 text-[10px] font-medium transition-colors",
                  activeId === heading.id ? "text-blue-500" : "text-gray-400 group-hover:text-blue-400"
                )}>
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <span className="line-clamp-2">{truncateText(heading.text, 35)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

