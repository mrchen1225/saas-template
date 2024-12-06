import { db } from "@/database/database";
import { ShareActivation, ShareLink } from "@/prisma/types";
import { Insertable, Selectable } from "kysely";

export type NewShareLink = Insertable<ShareLink>;

export type NewShareActivation = Insertable<ShareActivation>;

export async function findShareLinkByUserId(userId: string) {
  return await db
    .selectFrom("ShareLink")
    .where("userId", "=", userId)
    .selectAll()
    .executeTakeFirst();
}

export async function findShareLinkByShareLink(shareLinks: string) {
  return await db
    .selectFrom("ShareLink")
    .where("shareLink", "=", shareLinks)
    .selectAll()
    .executeTakeFirst();
}

export async function createShareLink({ userId, shareLink }: { userId: string, shareLink: string }) {
  return await db
    .insertInto("ShareLink")
    .values({
        userId,
        shareLink,
      })
    .returningAll()
    .executeTakeFirst();
}

export async function findShareActivation(shareLinkId: string, activatedByUserId: string) {
  return await db
    .selectFrom("ShareActivation")
    .where("shareLinkId", "=", shareLinkId)
    .where("activatedByUserId", "=", activatedByUserId)
    .selectAll()
    .executeTakeFirst();
}

export async function createShareActivation(newShareActivation: NewShareActivation) {
  return await db
    .insertInto("ShareActivation")
    .values(newShareActivation)
    .returningAll()
    .executeTakeFirst();
}

export async function countShareActivations(shareLinkId: string) {
  const result = await db
    .selectFrom("ShareActivation")
    .where("shareLinkId", "=", shareLinkId)
    .select(db.fn.count("id").as("count"))
    .executeTakeFirst();
  
  return Number(result?.count || 0);
}

export async function listShareActivationsByShareLinkId(shareLinkId: string) {
  return await db
    .selectFrom("ShareActivation")
    .where("shareLinkId", "=", shareLinkId)
    .selectAll()
    .execute();
}

export async function findShareActivationByShareLinkIdAndUserId(shareLinkId: string, activatedByUserId: string) {
  return await db
    .selectFrom("ShareActivation")
    .where("shareLinkId", "=", shareLinkId)
    .where("activatedByUserId", "=", activatedByUserId)
    .selectAll()
    .executeTakeFirst();
}