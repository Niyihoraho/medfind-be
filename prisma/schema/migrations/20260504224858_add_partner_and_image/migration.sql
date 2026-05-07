-- AlterTable
ALTER TABLE "facilities" ADD COLUMN     "image_url" VARCHAR(512),
ADD COLUMN     "is_partner" BOOLEAN NOT NULL DEFAULT false;
