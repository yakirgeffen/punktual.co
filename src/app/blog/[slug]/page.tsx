import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CalendarDays, Clock, Sparkles, ArrowLeft, Share2 } from 'lucide-react';
import { getAllPosts, getPostBySlug } from '@/utils/blog';

export const revalidate = 60;

type BlogPostRouteParams = Promise<{ slug: string }>;

type BlogPostPageProps = {
  params: BlogPostRouteParams;
};

export async function generateStaticParams() {
  const posts = await getAllPosts({ limit: 100 });
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: 'Post not found — Punktual Blog',
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://punktual.co';
  const canonical = post.seo?.canonicalUrl ?? `${baseUrl}/blog/${post.slug}`;
  const keywords = post.seo?.keywords ?? undefined;

  return {
    title: post.seo?.metaTitle ?? `${post.title} — Punktual Blog`,
    description: post.seo?.metaDescription ?? post.description,
    keywords,
    alternates: { canonical },
    openGraph: {
      type: 'article',
      url: canonical,
      title: post.seo?.metaTitle ?? post.title,
      description: post.seo?.metaDescription ?? post.description,
      publishedTime: post.publishedAt,
      authors: [post.author],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.seo?.metaTitle ?? post.title,
      description: post.seo?.metaDescription ?? post.description,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const publishedDate = new Date(post.publishedAt).toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://punktual.co';
  const canonicalUrl = post.seo?.canonicalUrl ?? `${baseUrl}/blog/${post.slug}`;
  const keywords = post.seo?.keywords ?? [];
  const hasFaqs = post.faqs.length > 0;
  const extractTldrBullets = (markdown?: string) => {
    if (!markdown) return [];
    const match = markdown.match(/## TL;DR([\s\S]*?)(?:\n##|\n###|$)/);
    if (!match) return [];
    return Array.from(match[1].matchAll(/^\s*-\s+(.*)$/gm)).map((entry) => entry[1].trim()).filter(Boolean);
  };

  const rawTldrBullets = extractTldrBullets(post.content);
  const tldrBullets =
    rawTldrBullets.length > 0
      ? rawTldrBullets
      : [post.excerpt, post.description]
          .map((value) => (value ?? '').trim())
          .filter(Boolean);

  const template = post.template ?? 'session-log';

  const relatedPosts = (await getAllPosts({ limit: 12 }))
    .filter(
      (candidate) =>
        candidate.slug !== post.slug && (candidate.template ?? 'session-log') === template,
    )
    .slice(0, 3);

  const sessionQuickLinks = [
    { label: 'Overview', href: '#overview' },
    { label: 'Deep dive', href: '#article-body' },
    { label: hasFaqs ? 'Highlights & FAQs' : 'Highlights', href: '#highlights' },
  ];

  const relatedHeading =
    template === 'session-log' ? 'Related sessions worth exploring' : 'Related posts worth exploring';
  const relatedIntro =
    template === 'session-log'
      ? 'Pair this recap with a couple of recent logs to give teammates extra context.'
      : 'Pair this guide with additional reads to deepen your playbook.';

  const relatedSection = (
    <div className="mx-auto mt-16 max-w-6xl px-6 sm:px-8 lg:px-12">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">{relatedHeading}</h3>
        <p className="mt-2 text-sm text-slate-600">{relatedIntro}</p>
        <ul className="mt-4 space-y-4">
          {relatedPosts.length > 0 ? (
            relatedPosts.map((related) => (
              <li
                key={related.slug}
                className="rounded-lg border border-slate-200 bg-slate-50 p-4 transition hover:border-emerald-200"
              >
                <Link href={`/blog/${related.slug}`} className="flex flex-col gap-1">
                  <span className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-600">
                    {related.category}
                  </span>
                  <span className="text-base font-semibold text-slate-900">{related.title}</span>
                  <span className="text-xs text-slate-500">
                    {new Date(related.publishedAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                    {' • '}
                    {related.readingTimeText}
                  </span>
                </Link>
              </li>
            ))
          ) : (
            <li className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              No other posts in this theme yet. Once more logs are available, they’ll appear here automatically.
            </li>
          )}
        </ul>
      </section>
    </div>
  );

  const shareSection = (
    <div className="mx-auto mt-10 max-w-3xl px-6 sm:px-8 lg:px-12">
      <section className="rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
        <h3 className="text-base font-semibold text-slate-900">Share this recap</h3>
        <p className="mt-2 text-sm text-slate-600">
          Drop the canonical link in Slack or email it to the next teammate who should see it.
        </p>
        <div className="mt-4 flex flex-col items-center gap-3 md:flex-row md:justify-center">
          <code className="rounded-full bg-slate-100 px-4 py-2 text-xs text-slate-600">
            {canonicalUrl}
          </code>
          <a
            href={`mailto:?subject=${encodeURIComponent(post.title)}&body=${encodeURIComponent(canonicalUrl)}`}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-emerald-200 hover:text-emerald-600"
          >
            <Share2 className="h-4 w-4" />
            Email link
          </a>
        </div>
      </section>
    </div>
  );

  const tldrPoints = Array.from(
    new Set([
      post.description,
      `Focus area: ${post.category}`,
      `Estimated reading time: ${post.readingTimeText}`,
    ]),
  );

  const heroImageSrc =
    'https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=1200&q=80';

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.seo?.metaTitle ?? post.title,
    description: post.seo?.metaDescription ?? post.description,
    datePublished: post.publishedAt,
    author: {
      '@type': 'Organization',
      name: post.author,
    },
    mainEntityOfPage: canonicalUrl,
    keywords: keywords.length ? keywords.join(', ') : undefined,
    image: heroImageSrc,
  };

  const faqJsonLd = hasFaqs
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: post.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      }
    : null;

  if (template !== 'session-log') {
    const simpleNav = [
      { label: 'Overview', href: '#overview' },
      { label: 'Article', href: '#article-body' },
    ];

    return (
      <article className="bg-slate-50 pb-24 text-slate-900">
        <div className="bg-white">
          <div className="mx-auto max-w-4xl px-6 py-12 sm:px-8 lg:px-12">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 shadow-sm transition hover:text-emerald-600"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to blog
            </Link>

            <h1 className="mt-8 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
              {post.title}
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
              {post.description}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3 text-sm text-slate-600">
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-1">
                <Sparkles className="h-4 w-4 text-emerald-500" />
                {post.category}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-1">
                <CalendarDays className="h-4 w-4 text-emerald-500" />
                {publishedDate}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-1">
                <Clock className="h-4 w-4 text-emerald-500" />
                {post.readingTimeText}
              </span>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-12 flex max-w-6xl flex-col gap-10 px-6 sm:px-8 lg:flex-row lg:px-12">
          <main className="min-w-0 flex-1 space-y-10">
            <section id="overview" className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
                TL;DR
              </h2>
              <ul className="mt-4 space-y-2 text-sm leading-relaxed text-slate-600">
                {tldrBullets.map((point, index) => (
                  <li key={index}>
                    <span className="mr-2 text-emerald-500">•</span>
                    {point}
                  </li>
                ))}
              </ul>
            </section>

            <section
              id="article-body"
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
                Article
              </h2>
              <div className="article-content mt-4">
                <div dangerouslySetInnerHTML={{ __html: post.html }} />
              </div>
            </section>
          </main>

          <aside className="w-full space-y-6 lg:w-80">
            <div className="sticky top-20 space-y-6">
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
                  Quick navigation
                </h3>
                <ul className="mt-4 space-y-3 text-sm text-slate-600">
                  {simpleNav.map((item) => (
                    <li key={item.href}>
                      <a href={item.href} className="hover:text-emerald-600">
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>
        </div>

        {relatedSection}
        {shareSection}

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
        />
        {faqJsonLd ? (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
          />
        ) : null}
      </article>
    );
  }

  return (
    <article className="min-h-screen bg-slate-50 pb-24 text-slate-900">
      <div className="bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 pb-12 pt-16 sm:px-8 lg:px-12 lg:grid-cols-[3fr_2fr] lg:gap-12">
          <div>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 shadow-sm transition hover:text-emerald-600"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to sessions
            </Link>

            <h1 className="mt-8 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
              {post.title}
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
              {post.description}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3 text-sm text-slate-600">
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-1">
                <Sparkles className="h-4 w-4 text-emerald-500" />
                {post.category}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-1">
                <CalendarDays className="h-4 w-4 text-emerald-500" />
                {publishedDate}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-1">
                <Clock className="h-4 w-4 text-emerald-500" />
                {post.readingTimeText}
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-100 p-6">
            <div className="relative h-48 w-full overflow-hidden rounded-lg">
              <Image
                src={heroImageSrc}
                alt="Session hero"
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 400px, 100vw"
                priority
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-12 flex max-w-6xl flex-col gap-10 px-6 sm:px-8 lg:flex-row lg:px-12">
        <main className="min-w-0 flex-1 space-y-12">
          <section
            id="overview"
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
              TL;DR
            </h2>
            <ul className="mt-4 space-y-2 text-sm leading-relaxed text-slate-600">
              {tldrPoints.map((point, index) => (
                <li key={index}>
                  <span className="mr-2 text-emerald-500">•</span>
                  {point}
                </li>
              ))}
            </ul>
          </section>

          <section
            id="article-body"
            className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm"
          >
            <h2 className="text-lg font-semibold text-slate-900">Deep dive</h2>
            <p className="mt-2 text-sm text-slate-500">
              Full breakdown of experiments, metrics, and decisions from this Punktual session.
            </p>
            <div className="article-content mt-6">
              <div dangerouslySetInnerHTML={{ __html: post.html }} />
            </div>
          </section>

          <section
            id="highlights"
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-5">
                <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600">
                  What worked
                </h3>
                <ul className="mt-3 space-y-2 text-sm text-emerald-900/80">
                  <li>• Highlight the experiment or tactic that delivered the clearest gain.</li>
                  <li>• Call out the customer or funnel metric that moved.</li>
                  <li>• Note the system or tooling change that unlocked a win.</li>
                </ul>
              </div>
              <div className="rounded-lg border border-rose-100 bg-rose-50 p-5">
                <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-rose-600">
                  What broke
                </h3>
                <ul className="mt-3 space-y-2 text-sm text-rose-900/80">
                  <li>• Summarise the failure modes that slowed the session.</li>
                  <li>• Document the immediate mitigation or rollback.</li>
                  <li>• Capture the follow-up ticket or owner responsible.</li>
                </ul>
              </div>
            </div>

            {hasFaqs ? (
              <div id="faqs" className="mt-8 rounded-lg border border-slate-200 bg-slate-50 p-5">
                <h3 className="text-base font-semibold text-slate-900">Frequently asked questions</h3>
                <dl className="mt-4 space-y-4 text-sm text-slate-600">
                  {post.faqs.map((faq, index) => (
                    <div
                      key={index}
                      className="space-y-1 rounded-md border border-slate-200 bg-white p-4"
                    >
                      <dt className="font-medium text-slate-800">{faq.question}</dt>
                      <dd>{faq.answer}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ) : null}
          </section>
        </main>

        <aside className="w-full space-y-6 lg:w-80">
          <div className="sticky top-20 space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
                Quick navigation
              </h3>
              <ul className="mt-4 space-y-3 text-sm text-slate-600">
                {sessionQuickLinks.map((link) => (
                  <li key={link.href}>
                    <a href={link.href} className="hover:text-emerald-600">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>
      </div>

      {relatedSection}
      {shareSection}

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      {faqJsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      ) : null}
    </article>
  );
}
