import { PrismaClient } from '@prisma/client';
import { BlogPost } from '@/prisma/types';

const prisma = new PrismaClient();

export class BlogPostRepo {
  async getAllPosts(): Promise<BlogPost[]> {
    const posts = await prisma.blogPost.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return posts.map((post: { content: string; }) => ({
      ...post,
      excerpt: post.content.substring(0, 150) + '...'
    }));
  }

  async getPostBySlug(slug: string): Promise<BlogPost | null> {
    return prisma.blogPost.findUnique({
      where: { slug }
    });
  }

  async createPost(post: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>): Promise<BlogPost> {
    return prisma.blogPost.create({
      data: post
    });
  }

  async updatePost(id: string, post: Partial<BlogPost>): Promise<BlogPost> {
    return prisma.blogPost.update({
      where: { id },
      data: post
    });
  }

  async deletePost(id: string): Promise<void> {
    await prisma.blogPost.delete({
      where: { id }
    });
  }

  async getRecentPosts(limit: number = 5): Promise<[]> {
    const posts = await prisma.blogPost.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });

    return posts.map((post: { content: string; }) => ({
      ...post,
      excerpt: post.content.substring(0, 150) + '...'
    }));
  }

  async searchPosts(keyword: string): Promise<[]> {
    const posts = await prisma.blogPost.findMany({
      where: {
        OR: [
          { title: { contains: keyword } },
          { content: { contains: keyword } }
        ]
      },
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return posts.map((post: { content: string; }) => ({
      ...post,
      excerpt: post.content.substring(0, 150) + '...'
    }));
  }

  async getPostCount(): Promise<number> {
    return prisma.blogPost.count();
  }

  async getPaginatedPosts(page: number, pageSize: number): Promise<[]> {
    const posts = await prisma.blogPost.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: (page - 1) * pageSize,
      take: pageSize
    });

    return posts.map((post: { content: string; }) => ({
      ...post,
      excerpt: post.content.substring(0, 150) + '...'
    }));
  }
}
