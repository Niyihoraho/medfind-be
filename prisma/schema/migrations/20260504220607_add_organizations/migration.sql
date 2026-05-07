-- CreateEnum
CREATE TYPE "OwnershipType" AS ENUM ('public', 'private', 'ngo');

-- AlterTable
ALTER TABLE "facilities" ADD COLUMN     "category" "OwnershipType" NOT NULL DEFAULT 'public',
ADD COLUMN     "organization_id" BIGINT;

-- CreateTable
CREATE TABLE "organizations" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(191) NOT NULL,
    "email" VARCHAR(191),
    "phone" VARCHAR(20),
    "ownership_type" "OwnershipType" NOT NULL DEFAULT 'private',
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "facilities" ADD CONSTRAINT "facilities_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
