import { db } from "@/database/database";
import { BlogPostStatus } from "@/prisma/enums";
import { Insertable, Selectable } from "kysely";
import { BlogPost } from "@/prisma/types";

// 获取所有已发布的博客文章
export async function getAllPosts() {
  return await db
    .selectFrom("BlogPost")
    .where("status", "!=", BlogPostStatus.DELETED)
    .where("status", "!=", BlogPostStatus.DRAFT)
    .selectAll()
    .orderBy("createdAt", "desc")
    .execute();
}

// 根据ID获取单个博客文章
export async function getPostById(id: string) {
  return await db
    .selectFrom("BlogPost")
    .where("id", "=", id)
    .where("status", "!=", BlogPostStatus.DELETED)
    .selectAll()
    .executeTakeFirst();
}

// 创建新的博客文章
export async function createPost(post: Insertable<BlogPost>) {
  return await db
    .insertInto("BlogPost")
    .values(post)
    .returningAll()
    .executeTakeFirst();
}

// 更新博客文章
export async function updatePost(id: string, post: Partial<Selectable<BlogPost>>) {
  return await db
    .updateTable("BlogPost")
    .set(post)
    .where("id", "=", id)
    .returningAll()
    .executeTakeFirst();
}

// 删除博客文章（软删除）
export async function deletePost(id: string) {
  return await db
    .updateTable("BlogPost")
    .set({ status: BlogPostStatus.DELETED })
    .where("id", "=", id)
    .execute();
}

// 分页获取博客文章
export async function getPostsPaginated(page: number, pageSize: number) {
  const offset = (page - 1) * pageSize;
  return await db
    .selectFrom("BlogPost")
    .where("status", "!=", BlogPostStatus.DELETED)
    .selectAll()
    .orderBy("createdAt", "desc")
    .limit(pageSize)
    .offset(offset)
    .execute();
}

// 获取博客文章总数
export async function getTotalPostsCount(): Promise<number> {
  const result = await db
    .selectFrom("BlogPost")
    .where("status", "!=", BlogPostStatus.DELETED)
    .select(db.fn.count("id").as("count"))
    .executeTakeFirst();

  return Number(result?.count || 0);
}

export async function getBlogPost(slug: string) {
  return await db
    .selectFrom("BlogPost")
    .where("slug", "=", slug)
    .where("status", "!=", BlogPostStatus.DELETED)
    .selectAll()
    .executeTakeFirst();
}
