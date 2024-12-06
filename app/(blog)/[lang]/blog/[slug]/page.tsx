import { getBlogPost } from '@/actions/blog';
import ReactMarkdown from 'react-markdown';
import { Metadata } from 'next';
import remarkGfm from 'remark-gfm';  


export async function generateMetadata({ params }: { params: { lang: string; slug: string } }): Promise<Metadata> {
  const post = await getBlogPost(params.slug);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
  
  if (!post) {
    return {
      title: 'Article Not Found',
      description: 'Sorry, the article you requested does not exist.',
    };
  }

  const title = post.title.length > 60 ? post.title.substring(0, 57) + '...' : post.title;
  const description = post.description && post.description.length > 160 
    ? post.description.substring(0, 157) + '...' 
    : post.description || post.content.substring(0, 157) + '...';

  return {
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/blog/${params.slug}`,
    },
  };
}

export default async function BlogPostPage({ params }: { params: { lang: string; slug: string } }) {
  const post = await getBlogPost(params.slug);
  
  return (
    <>
      {post && (
        <article className="max-w-3xl mx-auto px-4 py-8">
          <header className="mb-8">
            <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
            {post.description && (
              <p className="text-xl text-gray-600 mb-4">{post.description}</p>
            )}
            <div className="text-sm text-gray-500">
              Published on {new Date(post.createdAt).toLocaleDateString('en-US')}
              {post.updatedAt !== post.createdAt && (
                <span> · Updated on {new Date(post.updatedAt).toLocaleDateString('en-US')}</span>
              )}
            </div>
          </header>
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown
              components={{
                h1: ({ node, ...props }) => <h2 className="text-3xl font-bold mt-6 mb-4" {...props} />,
                h2: ({ node, ...props }) => <h3 className="text-2xl font-semibold mt-5 mb-3" {...props} />,
                h3: ({ node, ...props }) => <h4 className="text-xl font-medium mt-4 mb-2" {...props} />,
                table: ({ node, ...props }) => <table className="border-collapse border border-gray-300" {...props} />,
                th: ({ node, ...props }) => <th className="border border-gray-300 px-4 py-2" {...props} />,
                td: ({ node, ...props }) => <td className="border border-gray-300 px-4 py-2" {...props} />,
              }}
              remarkPlugins={[remarkGfm]} // 添加 GFM 插件  
            >
              {post.content}
            </ReactMarkdown>
          </div>
        </article>
      )}
    </>
  )
}
