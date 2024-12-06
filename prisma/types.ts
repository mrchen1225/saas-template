import type { ColumnType } from "kysely";

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

import type { PictureStatus } from "./enums";

export type Picture = {
    id: Generated<string>;
    userId: string;
    tags: string[];
    params: unknown;
    url: string;
    description: string;
    status: PictureStatus;
    createdAt: Generated<Timestamp>;
    updatedAt: Generated<Timestamp>;
};

export type ShareLink = {
    id: Generated<string>;
    userId: string;
    shareLink: string;
    createdAt: Generated<Timestamp>;
    updatedAt: Generated<Timestamp>;
};

export type ShareActivation = {
    id: Generated<string>;
    shareLinkId: string;
    activatedByUserId: string;
    createdAt: Generated<Timestamp>;
};

import type { BlogPostStatus } from "./enums";

export type BlogPost = {
    id: Generated<string>;
    title: string;
    content: string;
    slug: string;
    status: BlogPostStatus;
    description: string | null;
    createdAt: Generated<Timestamp>;
    updatedAt: Generated<Timestamp>;
};

// 移除了 BlogPostPreview 类型，因为它在新的模型中没有对应


export type DB = {
    Picture: Picture;
    ShareLink: ShareLink;
    ShareActivation: ShareActivation;
    BlogPost: BlogPost;
};
