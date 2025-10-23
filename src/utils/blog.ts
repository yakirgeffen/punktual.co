'use server';

import DOMPurify from 'isomorphic-dompurify';
import { marked } from 'marked';
import readingTime from 'reading-time';

const CMS_BASE_URL =
  process.env.STRAPI_URL ||
  process.env.NEXT_PUBLIC_STRAPI_URL ||
  'http://localhost:1337';
const CMS_API_TOKEN = process.env.STRAPI_API_TOKEN;

type StrapiFAQResponse = {
  id?: number;
  question?: string | null;
  answer?: string | null;
};

type StrapiSeoResponse = {
  metaTitle?: string | null;
  metaDescription?: string | null;
  canonicalUrl?: string | null;
  keywords?: string[] | null;
};

type StrapiPostResponse = {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content?: string | null;
  publishedAt?: string | null;
  template?: string | null;
  faqs?: StrapiFAQResponse[] | null;
  seo?: StrapiSeoResponse | null;
};

export interface BlogFAQ {
  question: string;
  answer: string;
}

export interface BlogPostSummary {
  slug: string;
  title: string;
  description: string;
  excerpt: string;
  date: string;
  publishedAt: string;
  documentId: string;
  readingTimeText: string;
  readingTimeMinutes: number;
  readingTimeWords: number;
  author: string;
  category: string;
  tags: string[];
  template: string;
}

export interface BlogPostDetail extends BlogPostSummary {
  content: string;
  html: string;
  faqs: BlogFAQ[];
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    canonicalUrl?: string;
    keywords?: string[];
  };
}

const allowedTags = [
  'p',
  'strong',
  'em',
  'u',
  's',
  'blockquote',
  'code',
  'pre',
  'a',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'ul',
  'ol',
  'li',
  'hr',
  'img',
  'table',
  'thead',
  'tbody',
  'tr',
  'th',
  'td',
  'figure',
  'figcaption',
];

const allowedAttributes = ['href', 'src', 'alt', 'title', 'class', 'rel', 'target'];

function buildStrapiUrl(path: string, params: Record<string, string | string[]> = {}) {
  const url = new URL(path, CMS_BASE_URL);
  const searchParams = url.searchParams;

  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => searchParams.append(key, item));
    } else {
      searchParams.set(key, value);
    }
  });

  return url.toString();
}

async function fetchStrapiPosts(query: Record<string, string | string[]> = {}) {
  const params: Record<string, string | string[]> = {
    'filters[publishedAt][$notNull]': 'true',
    'sort[0]': 'publishedAt:desc',
    'fields[0]': 'title',
    'fields[1]': 'slug',
    'fields[2]': 'excerpt',
    'fields[3]': 'content',
    'fields[4]': 'publishedAt',
    'fields[5]': 'documentId',
    'fields[6]': 'template',
    ...query,
  };

  const url = buildStrapiUrl('/api/posts', params);
  const response = await fetch(url, {
    next: { revalidate: 60 },
    headers: {
      Accept: 'application/json',
      ...(CMS_API_TOKEN ? { Authorization: `Bearer ${CMS_API_TOKEN}` } : {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to load posts (${response.status})`);
  }

  const json = await response.json();
  const posts: StrapiPostResponse[] = Array.isArray(json?.data) ? json.data : [];
  return posts;
}

function toSummary(post: StrapiPostResponse): BlogPostSummary {
  const rawContent = post.content ?? '';
  const excerpt =
    (post.excerpt ?? '')
      .trim()
      .replace(/\s+/g, ' ')
      .slice(0, 220) ||
    rawContent
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .join(' ')
      .slice(0, 220);

  const reading = readingTime(rawContent || excerpt);
  const date = post.publishedAt ?? new Date().toISOString();

  const templateLabelMap: Record<string, string> = {
    'session-log': 'Session Log',
    playbook: 'Playbook',
    'integration-guide': 'Integration Guide',
    'campaign-strategy': 'Campaign Strategy',
    comparison: 'Comparison',
    'case-study': 'Case Study',
  };

  return {
    slug: post.slug,
    title: post.title,
    description: excerpt,
    excerpt,
    date,
    publishedAt: date,
    documentId: post.documentId,
    readingTimeText: reading.text,
    readingTimeMinutes: reading.minutes,
    readingTimeWords: reading.words,
    author: 'Punktual Team',
    category: templateLabelMap[post.template ?? 'session-log'] ?? 'Post',
    tags: [],
    template: post.template ?? 'session-log',
  };
}

function markdownToHtml(markdown: string) {
  if (!markdown) return '';

  const rawHtml = marked.parse(markdown, { async: false });
  return DOMPurify.sanitize(rawHtml, {
    ALLOWED_TAGS: allowedTags,
    ALLOWED_ATTR: allowedAttributes,
    ALLOW_DATA_ATTR: false,
    USE_PROFILES: { html: true },
  });
}

export async function getAllPosts(options: { limit?: number } = {}): Promise<BlogPostSummary[]> {
  const { limit } = options;
  const query: Record<string, string | string[]> = {};
  if (limit) {
    query['pagination[pageSize]'] = String(limit);
  }

  try {
    const posts = await fetchStrapiPosts(query);
    return posts.map(toSummary);
  } catch (error) {
    console.error('[blog] Failed to fetch posts:', error);
    return [];
  }
}

export async function getPostBySlug(slug: string): Promise<BlogPostDetail | null> {
  const sanitizedSlug = slug.replace(/[^a-zA-Z0-9-_]/g, '');
  if (!sanitizedSlug || sanitizedSlug !== slug) {
    return null;
  }

  try {
    const posts = await fetchStrapiPosts({
      'filters[slug][$eq]': sanitizedSlug,
      'pagination[pageSize]': '1',
      'populate[faqs]': '*',
      'populate[seo]': '*',
    });

    const post = posts[0];
    if (!post) {
      return null;
    }

    const summary = toSummary(post);
    const html = markdownToHtml(post.content ?? '');

    const faqs: BlogFAQ[] = Array.isArray(post.faqs)
      ? post.faqs
          .map((faq) => ({
            question: faq?.question?.trim() ?? '',
            answer: faq?.answer?.trim() ?? '',
          }))
          .filter((faq) => faq.question && faq.answer)
      : [];

    const seo = post.seo
      ? {
          metaTitle: post.seo.metaTitle ?? undefined,
          metaDescription: post.seo.metaDescription ?? undefined,
          canonicalUrl: post.seo.canonicalUrl ?? undefined,
          keywords: post.seo.keywords ?? undefined,
        }
      : undefined;

    return {
      ...summary,
      content: post.content ?? '',
      html,
      faqs,
      seo,
    };
  } catch (error) {
    console.error(`[blog] Failed to fetch post ${slug}:`, error);
    return null;
  }
}
