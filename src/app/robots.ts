import type { MetadataRoute } from "next";
import { SITE_URL } from "@/data/site";

/**
 * ROBOTS
 * ---------------------------------------------------------------------------
 * Everything here is meant to be found. Nothing is disallowed, so nothing is
 * listed as disallowed — an empty ruleset is more honest than a decorative one.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
