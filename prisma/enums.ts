export const PictureStatus = {
    UNKNOWN: "UNKNOWN",
    UPLOADED:"UPLOADED",
    DESCRIBED:"DESCRIBED",
    PAID:"PAID",
    PROCESSING: "PROCESSING",
    PROCESSING_FAILED: "PROCESSING_FAILED",
    PROCESSING_SUCCESS: "PROCESSING_SUCCESS",
    PROCESSING_TIMEOUT: "PROCESSING_TIMEOUT",
    PROCESSING_CANCELLED: "PROCESSING_CANCELLED",
    PROCESSED: "PROCESSED",
    DELETED: "DELETED",
} as const;
export type PictureStatus = (typeof PictureStatus)[keyof typeof PictureStatus];

export const BlogPostStatus = {
    DRAFT: "DRAFT",
    PUBLISHED: "PUBLISHED",
    ARCHIVED: "ARCHIVED",
    DELETED: "DELETED",
} as const;
export type BlogPostStatus = (typeof BlogPostStatus)[keyof typeof BlogPostStatus];
