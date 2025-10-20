import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllPosts } from '@/utils/blog';
import { BlogHero } from '@/components/blog/BlogHero';
import { PostCard } from '@/components/blog/PostCard';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Punktual Blog — Session Logs & Growth Notes',
  description:
    'Deep dives from the Punktual team on calendar marketing, adoption experiments, and growth lessons from the Strapi integration sprints.',
};

export default async function BlogPage() {
  const posts = await getAllPosts({ limit: 50 });
  const featuredPost = posts[0];
  const remainingPosts = posts.slice(1);

  return (
    <div className="min-h-screen bg-slate-50 pb-24 text-slate-900">
      <div className="mx-auto max-w-6xl px-6 pt-12 sm:px-8 lg:px-12">
        <BlogHero
          totalPosts={posts.length}
          latestPost={
            featuredPost
              ? {
                  title: featuredPost.title,
                  slug: featuredPost.slug,
                  publishedAt: featuredPost.publishedAt,
                  readingTimeText: featuredPost.readingTimeText,
                }
              : undefined
          }
        />
      </div>

      <div className="mx-auto mt-12 max-w-6xl px-6 sm:px-8 lg:px-12">
        {posts.length === 0 ? (
          <div className="mt-20 rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-lg shadow-emerald-500/5">
            <h2 className="text-2xl font-semibold text-slate-900">No published sessions yet</h2>
            <p className="mx-auto mt-3 max-w-xl text-slate-600">
              Run the Strapi seeding script and revalidate the blog to surface the latest shipping
              notes. Once published, your newest session recap will live here automatically.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 py-12 md:grid-cols-2">
            {remainingPosts.length > 0 ? (
              remainingPosts.map((post, index) => (
                <PostCard key={post.slug} post={post} accentIndex={index} />
              ))
            ) : (
              <article className="col-span-full rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-800 shadow-lg shadow-emerald-500/5">
                <div className="mx-auto max-w-2xl space-y-4">
                  <h2 className="text-3xl font-semibold text-slate-900">
                    The very first log is live.
                  </h2>
                  <p className="text-lg text-slate-600">
                    New sessions will automatically cascade below once we ship more. In the meantime,
                    explore the latest recap above.
                  </p>
                  <Link
                    href={featuredPost ? `/blog/${featuredPost.slug}` : '/blog'}
                    className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-6 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2 focus:ring-offset-white"
                  >
                    Read the inaugural session
                  </Link>
                </div>
              </article>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
