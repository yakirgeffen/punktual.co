/**
 * RSS Feed Generation
 * Provides RSS feed for blog posts
 */

import { getAllPosts } from '@/utils/blog';

const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://punktual.co';
const SITE_NAME = 'Punktual';
const SITE_DESCRIPTION =
  'Learn how to maximize event attendance with "Add to Calendar" buttons and calendar marketing strategies';

export async function GET() {
  const posts = await getAllPosts({ limit: 50 });

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${SITE_NAME} Blog</title>
    <link>${SITE_URL}/blog</link>
    <description>${SITE_DESCRIPTION}</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml"/>
    ${posts
      .map((post) => {
        const postUrl = `${SITE_URL}/blog/${post.slug}`;
        const pubDate = new Date(post.date).toUTCString();

        return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <description><![CDATA[${post.description}]]></description>
      <pubDate>${pubDate}</pubDate>
      <author>${post.author}</author>
      <category>${post.category}</category>
      ${post.tags.map((tag) => `<category>${tag}</category>`).join('\n      ')}
    </item>`;
      })
      .join('\n')}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate',
    },
  });
}
