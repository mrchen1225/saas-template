-- CreateTable
CREATE TABLE "ShareLink" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "shareLink" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShareLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShareActivation" (
    "id" TEXT NOT NULL,
    "shareLinkId" TEXT NOT NULL,
    "activatedByUserId" TEXT NOT NULL,
    "activatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShareActivation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ShareLink_shareLink_key" ON "ShareLink"("shareLink");

-- CreateIndex
CREATE UNIQUE INDEX "ShareActivation_shareLinkId_activatedByUserId_key" ON "ShareActivation"("shareLinkId", "activatedByUserId");

-- AddForeignKey
ALTER TABLE "ShareActivation" ADD CONSTRAINT "ShareActivation_shareLinkId_fkey" FOREIGN KEY ("shareLinkId") REFERENCES "ShareLink"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
