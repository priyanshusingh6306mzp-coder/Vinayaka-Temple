import { SITE_CONFIG } from "@/content/site";
import { getSiteUrl } from "@/lib/site-url";
import { templeJsonLdPhone } from "@/lib/phone";

export function JsonLd() {
  const siteUrl = getSiteUrl();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": ["HinduTemple", "PlaceOfWorship"],
    "@id": `${siteUrl}#temple`,
    name: SITE_CONFIG.name,
    alternateName: SITE_CONFIG.nameHindi,
    description: SITE_CONFIG.description,
    url: siteUrl,
    hasMap: SITE_CONFIG.maps.link,
    telephone: templeJsonLdPhone,
    image: `${siteUrl}/images/temple.jpg`,
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE_CONFIG.location.streetAddress,
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
        opens: SITE_CONFIG.darshanSessions.morning.opens,
        closes: SITE_CONFIG.darshanSessions.morning.closes,
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
        opens: SITE_CONFIG.darshanSessions.evening.opens,
        closes: SITE_CONFIG.darshanSessions.evening.closes,
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
