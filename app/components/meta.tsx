export function Meta({
  titleSuffix,
  description,
}: {
  titleSuffix: string;
  description: string;
}) {
  return (
    <>
      <title>Dan Wu's personal website | {titleSuffix}</title>
      <meta name="description" content={description} />
      {/* Open Graph meta tags */}
      <meta
        property="og:title"
        content={`Dan Wu's personal website | ${titleSuffix}`}
      />
      <meta property="og:description" content={description} />
      <meta property="og:image" content="/og-image.png" />
      <meta
        property="og:image:alt"
        content="Dan Wu's personal website preview"
      />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Dan Wu's personal website" />
      {/* Twitter Card meta tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta
        name="twitter:title"
        content={`Dan Wu's personal website | ${titleSuffix}`}
      />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content="/og-image.png" />
      <meta
        name="twitter:image:alt"
        content="Dan Wu's personal website preview"
      />
    </>
  );
}
