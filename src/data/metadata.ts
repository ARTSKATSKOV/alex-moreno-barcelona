import { CONTACT, FAQ_ITEMS } from "@/data/site";

const DEFAULT_SITE_URL = "https://alex-moreno-barcelona-bd58.vercel.app";

function resolveSiteUrl(): string {
  const envUrl =
    typeof import.meta !== "undefined" && import.meta.env
      ? (import.meta.env["VITE_SITE_URL"] as string | undefined)
      : undefined;
  const raw = (envUrl && envUrl.trim()) || DEFAULT_SITE_URL;
  return raw.replace(/\/+$/, "");
}

export const SITE_URL = resolveSiteUrl();

/** Resolves a site-relative path (e.g. "/og-image.png") into an absolute HTTPS URL. */
export function absoluteUrl(path = "/"): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return normalized === "/" ? `${SITE_URL}/` : `${SITE_URL}${normalized}`;
}

export const SITE_METADATA = {
  siteName: "Alex Moreno — Strength & Conditioning",
  defaultTitle: "Alex Moreno — Strength & Conditioning, Barcelona",
  homeTitle: "Alex Moreno — Book Strength Sessions in Barcelona",
  description:
    "Book structured small-group and 1:1 strength & conditioning sessions with coach Alex Moreno in our Eixample studio and outdoors across Barcelona.",
  keywords:
    "strength and conditioning Barcelona, personal trainer Barcelona, small group training Eixample, outdoor fitness Barceloneta, Parc de la Ciutadella workouts, Montjuic training, Alex Moreno",
  author: "Alex Moreno",
  themeColor: "#171514",
  locale: "en_GB",
  alternateLocale: "es_ES",
  social: {
    instagram: CONTACT.instagramUrl,
    twitterHandle: "@alexmorenofit",
  },
  ogImage: {
    path: "/og-image.png",
    width: 1200,
    height: 630,
    type: "image/png",
    alt: "Alex Moreno Strength & Conditioning Barcelona — Get stronger, stay consistent, in under an hour.",
  },
} as const;

export function buildLocalBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "SportsActivityLocation",
    name: SITE_METADATA.siteName,
    description: SITE_METADATA.description,
    url: absoluteUrl("/"),
    image: absoluteUrl(SITE_METADATA.ogImage.path),
    email: CONTACT.email,
    telephone: CONTACT.whatsappDisplay,
    priceRange: "€15–€190",
    currenciesAccepted: "EUR",
    areaServed: {
      "@type": "City",
      name: "Barcelona",
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: "Carrer d'Aragó, Eixample",
      addressLocality: "Barcelona",
      postalCode: "08011",
      addressCountry: "ES",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "07:00",
        closes: "20:30",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Saturday", "Sunday"],
        opens: "09:00",
        closes: "12:00",
      },
    ],
    sameAs: [SITE_METADATA.social.instagram],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Strength & Conditioning Sessions",
      itemListElement: [
        {
          "@type": "Offer",
          name: "First Trial Session",
          price: "15",
          priceCurrency: "EUR",
        },
        {
          "@type": "Offer",
          name: "10-Session Pack",
          price: "190",
          priceCurrency: "EUR",
        },
        {
          "@type": "Offer",
          name: "Consistent Monthly Plan",
          price: "165",
          priceCurrency: "EUR",
        },
      ],
    },
  };
}

export function buildFaqJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.questionEn,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answerEn,
      },
    })),
  };
}

export function buildHomeHead() {
  const canonicalUrl = absoluteUrl("/");
  const ogImageUrl = absoluteUrl(SITE_METADATA.ogImage.path);

  return {
    meta: [
      { title: SITE_METADATA.homeTitle },
      { name: "description", content: SITE_METADATA.description },
      { name: "keywords", content: SITE_METADATA.keywords },
      { name: "author", content: SITE_METADATA.author },
      // Open Graph (WhatsApp, LinkedIn, Facebook, Slack, Discord, iMessage)
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: SITE_METADATA.siteName },
      { property: "og:url", content: canonicalUrl },
      { property: "og:title", content: SITE_METADATA.homeTitle },
      { property: "og:description", content: SITE_METADATA.description },
      { property: "og:locale", content: SITE_METADATA.locale },
      { property: "og:locale:alternate", content: SITE_METADATA.alternateLocale },
      { property: "og:image", content: ogImageUrl },
      { property: "og:image:secure_url", content: ogImageUrl },
      { property: "og:image:type", content: SITE_METADATA.ogImage.type },
      { property: "og:image:width", content: String(SITE_METADATA.ogImage.width) },
      { property: "og:image:height", content: String(SITE_METADATA.ogImage.height) },
      { property: "og:image:alt", content: SITE_METADATA.ogImage.alt },
      // Twitter / X Card
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:url", content: canonicalUrl },
      { name: "twitter:title", content: SITE_METADATA.homeTitle },
      { name: "twitter:description", content: SITE_METADATA.description },
      { name: "twitter:image", content: ogImageUrl },
      { name: "twitter:image:alt", content: SITE_METADATA.ogImage.alt },
      { name: "twitter:site", content: SITE_METADATA.social.twitterHandle },
      { name: "twitter:creator", content: SITE_METADATA.social.twitterHandle },
    ],
    links: [
      { rel: "canonical", href: canonicalUrl },
      { rel: "alternate", hrefLang: "en", href: canonicalUrl },
      { rel: "alternate", hrefLang: "es", href: canonicalUrl },
      { rel: "alternate", hrefLang: "x-default", href: canonicalUrl },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(buildLocalBusinessJsonLd()),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify(buildFaqJsonLd()),
      },
    ],
  };
}
