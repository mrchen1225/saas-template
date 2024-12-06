import { NextResponse } from 'next/server';
import slugify from 'slugify';
import { createPost } from '@/actions/blog';
import { BlogPostStatus } from '@/prisma/enums';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, content } = body;

    // 验证必填字段
    if (!title || !content) {
      return NextResponse.json(
        { error: "标题和内容为必填项" },
        { status: 400 }
      );
    }

    // 生成slug
    const slug = slugify(title, {
      lower: true,      // 转换为小写
      strict: true,     // 严格模式,移除特殊字符
      trim: true        // 移除首尾空格
    });

    // 创建博客文章
    try {
      const blog = await createPost({
          title,
          description,
          content,
          slug,
          status: BlogPostStatus.PUBLISHED,
          createdAt: new Date(),
          updatedAt: new Date()
      });

      return NextResponse.json({
        success: true,
        data: blog
      });
    } catch (error: any) {
      // PostgreSQL 唯一约束违反错误
      if (error.code === '23505') {
        return NextResponse.json({
          success: true,
          data: null,
          message: "已存在相同标题的文章"
        });
      }
      // 其他错误则抛出
      throw error;
    }

  } catch (error) {
    console.error("创建博客失败:", error);
    return NextResponse.json(
      { error: "创建博客失败" },
      { status: 500 }
    );
  }
}
