import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";

type HeadingProps = ComponentPropsWithoutRef<"h1">;
type ParagraphProps = ComponentPropsWithoutRef<"p">;
type ListProps = ComponentPropsWithoutRef<"ul">;
type ListItemProps = ComponentPropsWithoutRef<"li">;
type AnchorProps = ComponentPropsWithoutRef<"a">;
type BlockquoteProps = ComponentPropsWithoutRef<"blockquote">;
type CodeProps = ComponentPropsWithoutRef<"code">;
type PreProps = ComponentPropsWithoutRef<"pre">;
type TableProps = ComponentPropsWithoutRef<"table">;
type ImageProps = ComponentPropsWithoutRef<"img">;

export const MdxComponents = {
  h1: ({ className, ...props }: HeadingProps) => (
    <h1
      className={cn(
        "mt-2 scroll-m-20 text-3xl font-bold tracking-tight text-foreground sm:text-4xl",
        className,
      )}
      {...props}
    />
  ),
  h2: ({ className, children, ...props }: HeadingProps) => {
    const id =
      typeof children === "string"
        ? children
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "")
        : Array.isArray(children)
          ? children
              .filter((c) => typeof c === "string")
              .join(" ")
              .toLowerCase()
              .replace(/\s+/g, "-")
              .replace(/[^a-z0-9-]/g, "")
          : `heading-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <h2
        id={id}
        className={cn(
          "mt-10 scroll-m-20 border-b border-border pb-2 text-2xl font-semibold tracking-tight text-foreground first:mt-0 sm:text-3xl",
          className,
        )}
        {...props}
      >
        {children}
      </h2>
    );
  },
  h3: ({ className, children, ...props }: HeadingProps) => {
    const id =
      typeof children === "string"
        ? children
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "")
        : Array.isArray(children)
          ? children
              .filter((c) => typeof c === "string")
              .join(" ")
              .toLowerCase()
              .replace(/\s+/g, "-")
              .replace(/[^a-z0-9-]/g, "")
          : `heading-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <h3
        id={id}
        className={cn(
          "mt-8 scroll-m-20 text-xl font-semibold tracking-tight text-foreground sm:text-2xl",
          className,
        )}
        {...props}
      >
        {children}
      </h3>
    );
  },
  h4: ({ className, ...props }: HeadingProps) => (
    <h4
      className={cn(
        "mt-8 scroll-m-20 text-lg font-semibold tracking-tight text-foreground sm:text-xl",
        className,
      )}
      {...props}
    />
  ),
  h5: ({ className, ...props }: HeadingProps) => (
    <h5
      className={cn(
        "mt-8 scroll-m-20 text-base font-semibold tracking-tight text-foreground sm:text-lg",
        className,
      )}
      {...props}
    />
  ),
  h6: ({ className, ...props }: HeadingProps) => (
    <h6
      className={cn(
        "mt-8 scroll-m-20 text-sm font-semibold tracking-tight text-foreground sm:text-base",
        className,
      )}
      {...props}
    />
  ),
  p: ({ className, ...props }: ParagraphProps) => (
    <p
      className={cn(
        "leading-7 text-foreground/90 [&:not(:first-child)]:mt-6",
        className,
      )}
      {...props}
    />
  ),
  ul: ({ className, ...props }: ListProps) => (
    <ul
      className={cn("my-6 ml-6 list-disc text-foreground/90", className)}
      {...props}
    />
  ),
  ol: ({ className, ...props }: ListProps) => (
    <ol
      className={cn("my-6 ml-6 list-decimal text-foreground/90", className)}
      {...props}
    />
  ),
  li: ({ className, ...props }: ListItemProps) => (
    <li className={cn("mt-2", className)} {...props} />
  ),
  blockquote: ({ className, ...props }: BlockquoteProps) => (
    <blockquote
      className={cn(
        "mt-6 border-l-4 border-primary/50 pl-6 italic text-muted-foreground",
        className,
      )}
      {...props}
    />
  ),
  a: ({ className, href, ...props }: AnchorProps) => {
    const isInternal = href?.startsWith("/") || href?.startsWith("#");
    if (isInternal) {
      return (
        <Link
          href={href || "#"}
          className={cn(
            "font-medium text-primary underline underline-offset-4 hover:text-primary/80 transition-colors",
            className,
          )}
          {...props}
        />
      );
    }
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "font-medium text-primary underline underline-offset-4 hover:text-primary/80 transition-colors",
          className,
        )}
        {...props}
      />
    );
  },
  code: ({ className, ...props }: CodeProps) => (
    <code
      className={cn(
        "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm text-foreground",
        className,
      )}
      {...props}
    />
  ),
  pre: ({ className, ...props }: PreProps) => (
    <pre
      className={cn(
        "mb-4 mt-6 overflow-x-auto rounded-lg border border-border bg-muted p-4",
        className,
      )}
      {...props}
    />
  ),
  table: ({ className, ...props }: TableProps) => (
    <div className="my-6 w-full overflow-y-auto">
      <table
        className={cn(
          "w-full border-collapse text-sm text-foreground",
          className,
        )}
        {...props}
      />
    </div>
  ),
  tr: ({ className, ...props }: ComponentPropsWithoutRef<"tr">) => (
    <tr
      className={cn(
        "m-0 border-t border-border p-0 even:bg-muted/50",
        className,
      )}
      {...props}
    />
  ),
  th: ({ className, ...props }: ComponentPropsWithoutRef<"th">) => (
    <th
      className={cn(
        "border border-border px-4 py-2 text-left font-bold text-foreground [&[align=center]]:text-center [&[align=right]]:text-right",
        className,
      )}
      {...props}
    />
  ),
  td: ({ className, ...props }: ComponentPropsWithoutRef<"td">) => (
    <td
      className={cn(
        "border border-border px-4 py-2 text-left text-foreground/90 [&[align=center]]:text-center [&[align=right]]:text-right",
        className,
      )}
      {...props}
    />
  ),
  img: ({ className, alt, src, width, height, ...props }: ImageProps) => {
    if (!src) return null;
    // Ensure src is a string (not Blob) for Next.js Image
    const srcString = typeof src === "string" ? src : "";
    if (!srcString) return null;
    return (
      <Image
        src={srcString}
        alt={alt || ""}
        width={typeof width === "number" ? width : 720}
        height={typeof height === "number" ? height : 405}
        className={cn("rounded-md border border-border my-6", className)}
        {...props}
      />
    );
  },
  hr: ({ ...props }) => <hr className="my-8 border-border" {...props} />,
  strong: ({ className, ...props }: ComponentPropsWithoutRef<"strong">) => (
    <strong
      className={cn("font-semibold text-foreground", className)}
      {...props}
    />
  ),
  em: ({ className, ...props }: ComponentPropsWithoutRef<"em">) => (
    <em className={cn("italic", className)} {...props} />
  ),
};
