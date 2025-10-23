#!/usr/bin/env node

/**
 * Generate sitemap.xml into the public directory.
 * Mirrors the logic from src/app/sitemap.ts so the static file
 * stays aligned with the dynamic metadata route.
 */

import { writeFile } from 'fs/promises';
import { resolve } from 'path';

const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://punktual.co';
const CMS_BASE_URL =
  process.env.STRAPI_URL ||
  process.env.NEXT_PUBLIC_STRAPI_URL ||
  'http://localhost:1337';
const CMS_API_TOKEN = process.env.STRAPI_API_TOKEN || '';

const now = new Date();

const staticPages = [
  {
    loc: SITE_URL,
    lastmod: now,
    changefreq: 'monthly',
    priority: '1.0',
  },
  {
    loc: `${SITE_URL}/blog`,
    lastmod: now,
    changefreq: 'weekly',
    priority: '0.8',
  },
  {
    loc: `${SITE_URL}/help`,
    lastmod: now,
    changefreq: 'weekly',
    priority: '0.6',
  },
  {
    loc: `${SITE_URL}/support`,
    lastmod: now,
    changefreq: 'monthly',
    priority: '0.6',
  },
  {
    loc: `${SITE_URL}/contact`,
    lastmod: now,
    changefreq: 'monthly',
    priority: '0.5',
  },
  {
    loc: `${SITE_URL}/status`,
    lastmod: now,
    changefreq: 'daily',
    priority: '0.5',
  },
  {
    loc: `${SITE_URL}/privacy`,
    lastmod: now,
    changefreq: 'yearly',
    priority: '0.3',
  },
  {
    loc: `${SITE_URL}/terms`,
    lastmod: now,
    changefreq: 'yearly',
    priority: '0.3',
  },
];

async function fetchBlogPosts() {
  let didFail = false;
  const params = new URLSearchParams({
    'filters[publishedAt][$notNull]': 'true',
    'sort[0]': 'publishedAt:desc',
    'fields[0]': 'slug',
    'fields[1]': 'publishedAt',
    'pagination[pageSize]': '200',
  });

  try {
    const response = await fetch(`${CMS_BASE_URL}/api/posts?${params.toString()}`, {
      headers: {
        Accept: 'application/json',
        ...(CMS_API_TOKEN ? { Authorization: `Bearer ${CMS_API_TOKEN}` } : {}),
      },
    });

    if (!response.ok) {
      console.warn(`[sitemap] Failed to fetch posts (${response.status})`);
      didFail = true;
      return { entries: [], didFail };
    }

    const json = await response.json();
    const posts = Array.isArray(json?.data) ? json.data : [];

    const entries = posts
      .map((post) => ({
        loc: `${SITE_URL}/blog/${post?.slug}`,
        lastmod: post?.publishedAt ? new Date(post.publishedAt) : now,
        changefreq: 'monthly',
        priority: '0.7',
      }))
      .filter((entry) => Boolean(entry.loc));

    return { entries, didFail };
  } catch (error) {
    console.warn('[sitemap] Failed to load blog posts:', error);
    didFail = true;
    return { entries: [], didFail };
  }
}

function formatDate(date) {
  if (!(date instanceof Date) || Number.isNaN(date.valueOf())) {
    return now.toISOString();
  }
  return date.toISOString();
}

function buildXmlEntry(entry) {
  return [
    '  <url>',
    `    <loc>${entry.loc}</loc>`,
    `    <lastmod>${formatDate(entry.lastmod)}</lastmod>`,
    `    <changefreq>${entry.changefreq}</changefreq>`,
    `    <priority>${entry.priority}</priority>`,
    '  </url>',
  ].join('\n');
}

async function main() {
  const { entries: blogEntries, didFail } = await fetchBlogPosts();
  const allEntries = [...staticPages, ...blogEntries];

  const xmlBody = allEntries.map(buildXmlEntry).join('\n');
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    xmlBody,
    '</urlset>',
  ].join('\n');

  const outputPath = resolve(process.cwd(), 'public', 'sitemap.xml');
  await writeFile(outputPath, xml);
  console.log(`Generated sitemap with ${allEntries.length} entries at ${outputPath}`);

  if (didFail) {
    console.error(
      '[sitemap] Blog entries were omitted because the Strapi API was unreachable. Re-run once STRAPI_URL/NEXT_PUBLIC_STRAPI_URL points to a live instance.'
    );
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error('[sitemap] Failed to generate sitemap:', error);
  process.exit(1);
});
