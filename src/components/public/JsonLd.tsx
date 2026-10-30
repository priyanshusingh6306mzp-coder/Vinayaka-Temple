import { SITE_CONFIG } from "@/content/site";

export function JsonLd() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vinayaka-temple.vercel.app";

  const structuredData = {
    "@context": "https://schema.org",
    "@type": ["HinduTemple", "PlaceOfWorship"],
    "@id": `${siteUrl}#temple`,
    name: SITE_CONFIG.name,
    alternateName: SITE_CONFIG.nameHindi,
    description: SITE_CONFIG.description,
    url: siteUrl,
    telephone: "+91-7982048559",
    image: `${siteUrl}/images/hero-placeholder.svg`,
    address: {
      "@type": "PostalAddress",
      streetAddress: `${SITE_CONFIG.location.campus}, ${SITE_CONFIG.location.block}`,
      addressLocality: SITE_CONFIG.location.city,
      addressRegion: SITE_CONFIG.location.state,
      postalCode: SITE_CONFIG.location.pincode,
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 28.612248,
      longitude: 77.369795,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        opens: "06:00",
        closes: "11:30",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        opens: "16:30",
        closes: "20:30",
      },
    ],
    amenityFeature: SITE_CONFIG.amenities.map((amenity) => ({
      "@type": "LocationFeatureSpecification",
      name: amenity.title,
      value: true,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
