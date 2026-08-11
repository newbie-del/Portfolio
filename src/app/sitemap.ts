import type { MetadataRoute } from "next";
import { NAV, SITE_URL } from "@/data/site";
import { PROJECTS } from "@/data/projects";

/**
 * SITEMAP
 * ---------------------------------------------------------------------------
 * Generated from the same arrays the navigation and archive render from, so a
 * route can never exist in one and be missing from the other.
 *
 * `lastModified` is the build timestamp — the only date here that is actually
 * true. No per-page edit dates are claimed, because none are recorded.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const built = new Date();

  const pages = NAV.map((item) => ({
    url: `${SITE_URL}${item.href === "/" ? "" : item.href}`,
    lastModified: built,
    changeFrequency: "monthly" as const,
    priority: item.href === "/" ? 1 : 0.8,
  }));

  const projects = PROJECTS.map((project) => ({
    url: `${SITE_URL}/work/${project.slug}`,
    lastModified: built,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...pages, ...projects];
}
