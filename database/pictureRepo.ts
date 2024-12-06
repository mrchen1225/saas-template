import { db } from "@/database/database";
import { PictureStatus } from "@/prisma/enums";
import { Picture } from "@/prisma/types";
import { Insertable, Selectable } from "kysely";

export async function findPictureById(id: string) {
  return await db
    .selectFrom("Picture")
    .where("id", "=", id)
    .where("status", "!=", PictureStatus.DELETED)
    .selectAll()
    .executeTakeFirst();
}

export async function updatePictureUserId(pictureId: string, userId: string) {
  return await db
    .updateTable("Picture")
    .set({ userId: userId })
    .where("id", "=", pictureId)
    .execute();
}

export async function findPictures(criteria: Partial<Selectable<Picture>>) {
  let query = db.selectFrom("Picture").where("status", "!=", PictureStatus.DELETED);
  if (criteria.id) {
    query = query.where("id", "=", criteria.id);
  }
  if (criteria.userId) {
    query = query.where("userId", "=", criteria.userId);
  }
  if (criteria.status) {
    query = query.where("status", "=", criteria.status);
  }
  return await query.selectAll().orderBy("createdAt", "desc").execute();
}

export async function getTotalPicturesCount(): Promise<number> {
  const result = await db
    .selectFrom("Picture")
    .where("status", "!=", PictureStatus.DELETED)
    .select(db.fn.count("id").as("count"))
    .executeTakeFirst();

  return Number(result?.count || 0);
}

export async function listPicturesPaginated(page: number, pageSize: number) {
  const offset = (page - 1) * pageSize;
  let query = db
    .selectFrom("Picture")
    .where("status", "!=", PictureStatus.DELETED)
    .orderBy("createdAt desc")
    .limit(pageSize)
    .offset(offset);
  return await query.selectAll().execute();
}

export async function listPicturesByUserIdPaginated(userId: string, offset: number, limit: number) {
  const safeOffset = Math.max(0, offset);
  const safeLimit = Math.max(1, limit);

  console.log("safeOffset: ", safeOffset);
  console.log("safeLimit: ", safeLimit);
  console.log("userId: ", userId);
  
  // 使用 safeOffset 和 safeLimit 进行查询
  // ...
  return await db
    .selectFrom("Picture")
    .where("userId", "=", userId)
    .where("status", "!=", PictureStatus.DELETED)
    .where("createdAt", ">=", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) // 7天前的时间
    .orderBy("createdAt", "desc") 
    .limit(safeLimit)
    .offset(safeOffset)
    .selectAll()
    .execute();
}

export async function countPicturesByUserId(userId: string) {
  return await db
    .selectFrom("Picture")
    .where("userId", "=", userId)
    .where("status", "!=", PictureStatus.DELETED)
    .where("createdAt", ">=", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) // 7天前的时间
    .select(db.fn.count("id").as("count"))
    .executeTakeFirstOrThrow();
}

export async function createPicture(picture: Insertable<Picture>) {
  return await db
    .insertInto("Picture")
    .values(picture)
    .returning(['id'])
    .executeTakeFirstOrThrow();
}

export async function deletePicture(id: string) {
  return await db
    .updateTable("Picture")
    .set({ status: PictureStatus.DELETED })
    .where("id", "=", id)
    .execute();
}

export async function updatePictureDescription(id: string, description: string) {
  return await db
    .updateTable("Picture")
    .set({ description: description , status: PictureStatus.DESCRIBED })
    .where("id", "=", id)
    .execute();
}

export async function updatePictureStatus(id: string, status: PictureStatus) {
  return await db
    .updateTable("Picture")
    .set({ status: status })
    .where("id", "=", id)
    .execute();
}

export async function deletePictureByUserIdAndPictureId(pictureId: string, userId: string ) {
  return await db
    .updateTable("Picture")
    .set({ status: PictureStatus.DELETED })
    .where("id", "=", pictureId)
    .where("userId", "=", userId)
    .execute();
}