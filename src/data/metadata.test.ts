import { describe, expect, it } from "vitest";
import { FAQ_ITEMS } from "@/data/site";
import {
  SITE_METADATA,
  absoluteUrl,
  buildFaqJsonLd,
  buildHomeHead,
  buildLocalBusinessJsonLd,
} from "./metadata";

describe("metadata", () => {
  it("resolves absolute HTTPS URLs cleanly", () => {
    expect(absoluteUrl("/")).toMatch(/^https:\/\/.+\/$/);
    expect(absoluteUrl("/og-image.png")).toMatch(/^https:\/\/.+\/og-image\.png$/);
    expect(absoluteUrl("og-image.png")).toMatch(/^https:\/\/.+\/og-image\.png$/);
  });

  it("builds complete Open Graph and Twitter metadata with 1200x630 absolute image URLs and zero Lovable references", () => {
    const head = buildHomeHead();
    const ogImage = head.meta.find((m) => "property" in m && m.property === "og:image");
    const ogWidth = head.meta.find((m) => "property" in m && m.property === "og:image:width");
    const ogHeight = head.meta.find((m) => "property" in m && m.property === "og:image:height");
    const twitterImage = head.meta.find((m) => "name" in m && m.name === "twitter:image");
    const canonical = head.links.find((l) => l.rel === "canonical");

    expect(ogImage && "content" in ogImage ? ogImage.content : "").toMatch(
      /^https:\/\/.+\/og-image\.png$/,
    );
    expect(ogWidth && "content" in ogWidth ? ogWidth.content : "").toBe("1200");
    expect(ogHeight && "content" in ogHeight ? ogHeight.content : "").toBe("630");
    expect(twitterImage && "content" in twitterImage ? twitterImage.content : "").toMatch(
      /^https:\/\/.+\/og-image\.png$/,
    );
    expect(canonical?.href).toMatch(/^https:\/\/.+\/$/);

    const serialized = JSON.stringify(head).toLowerCase();
    expect(serialized).not.toContain("lovable");
  });

  it("produces valid SportsActivityLocation and FAQPage JSON-LD matching FAQ_ITEMS", () => {
    const business = buildLocalBusinessJsonLd();
    expect(business["@type"]).toBe("SportsActivityLocation");
    expect(business.name).toBe(SITE_METADATA.siteName);
    expect(business.image).toMatch(/^https:\/\/.+\/og-image\.png$/);

    const faq = buildFaqJsonLd();
    expect(faq["@type"]).toBe("FAQPage");
    expect(faq.mainEntity).toHaveLength(FAQ_ITEMS.length);
  });
});
