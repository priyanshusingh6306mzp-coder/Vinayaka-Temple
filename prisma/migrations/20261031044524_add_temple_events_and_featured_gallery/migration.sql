-- CreateEnum
CREATE TYPE "EventCategory" AS ENUM ('SANKASHTI', 'FESTIVAL', 'SPECIAL_POOJA', 'OTHER');

-- AlterTable
ALTER TABLE "gallery_images" ADD COLUMN     "eventId" TEXT,
ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "featuredOrder" INTEGER;

-- CreateTable
CREATE TABLE "temple_events" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" "EventCategory" NOT NULL,
    "eventDate" DATE NOT NULL,
    "startTime" TEXT,
    "description" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "temple_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "temple_events_eventDate_idx" ON "temple_events"("eventDate");

-- CreateIndex
CREATE INDEX "gallery_images_eventId_idx" ON "gallery_images"("eventId");

-- AddForeignKey
ALTER TABLE "gallery_images" ADD CONSTRAINT "gallery_images_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "temple_events"("id") ON DELETE SET NULL ON UPDATE CASCADE;
