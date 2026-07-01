type JsonLdProps = {
  data: unknown;
};

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      suppressHydrationWarning
      // JSON-LD must be in the raw JSON string form
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

