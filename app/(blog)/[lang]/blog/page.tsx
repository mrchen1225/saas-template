import Link from 'next/link';
import { BlogPost } from '@/prisma/types';
import { getAllPosts } from '@/actions/blog';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL;

export default async function BlogPostPage() {
  const posts = await getAllPosts();

  return (
    <>
      <h1 className="text-3xl font-bold mb-8">AI Disturbance Blog</h1>
      <ul className="space-y-6">
        {posts.map((post) => (
          <li key={post.slug} className="border-b pb-4">
            <Link href={`/blog/${post.slug}`} className="block">
              <h2 className="text-xl font-semibold mb-2 hover:text-blue-600 transition-colors">{post.title}</h2>
              <p className="text-sm text-gray-500">
                Published At {new Date(post.createdAt).toLocaleDateString('zh-CN')}
              </p>
            </Link>
          </li>
        ))}
      </ul>
      </>
  );
}

export const metadata = {
  title: 'AI Disturbance Blog',
  description: 'Explore how artists can protect their work from AI imitation. Learn about AI-disrupting filters that confuse machine learning models, preserving artistic uniqueness in the digital age.',
  alternates: {
    canonical: `${baseUrl}/blog`,
  },
};
