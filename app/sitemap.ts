import type { MetadataRoute } from "next";

import { prisma } from "@/lib/db/prisma";
import { APP_URL } from "@/lib/constants";

// Force dynamic — jangan prerender saat build
export const dynamic = "force-dynamic";
export const revalidate = 3600; // Revalidate tiap 1 jam

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static routes — selalu ada
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: APP_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${APP_URL}/explore`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${APP_URL}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${APP_URL}/register`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  // Fetch stories — kalau gagal, return static routes saja
  try {
    const stories = await prisma.story.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
      take: 5000,
    });

    const storyRoutes: MetadataRoute.Sitemap = stories.map((story) => ({
      url: `${APP_URL}/story/${story.slug}`,
      lastModified: story.updatedAt,
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    return [...staticRoutes, ...storyRoutes];
  } catch (err) {
    console.warn("[SITEMAP] Gagal fetch stories:", err);
    return staticRoutes;
  }
}