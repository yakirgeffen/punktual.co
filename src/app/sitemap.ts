/**
 * Dynamic Sitemap Generation
 * Includes blog posts for SEO
 */

import { MetadataRoute } from 'next';
import { getAllPosts } from '@/utils/blog';

const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://punktual.co';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getAllPosts();
  const now = new Date();
  const latestBlogUpdate =
    posts.reduce<Date | null>((latest, post) => {
      if (!post.date) return latest;
      const parsed = new Date(post.date);
      if (Number.isNaN(parsed.valueOf())) return latest;
      if (!latest || parsed > latest) {
        return parsed;
      }
      return latest;
    }, null) ?? now;

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 1,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: latestBlogUpdate,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/help`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/support`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/status`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: now,
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: now,
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
  ];

  // Blog post pages
  const blogPages = posts
    .filter((post) => Boolean(post.slug))
    .map((post) => {
      const parsedDate = post.date ? new Date(post.date) : now;
      const lastModified = Number.isNaN(parsedDate.valueOf()) ? now : parsedDate;
      return {
        url: `${SITE_URL}/blog/${post.slug}`,
        lastModified,
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      };
    });

  return [...staticPages, ...blogPages];
}
