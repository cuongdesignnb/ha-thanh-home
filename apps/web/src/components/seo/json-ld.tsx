/**
 * Server component that renders JSON-LD structured data.
 * Escapes `<` to prevent XSS in script tags.
 */
export function JsonLd({
  data,
}: {
  data: Record<string, unknown> | Record<string, unknown>[] | null | undefined;
}) {
  if (!data || (Array.isArray(data) && data.length === 0)) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
