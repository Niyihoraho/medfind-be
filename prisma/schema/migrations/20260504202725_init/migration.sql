-- CreateEnum
CREATE TYPE "FacilityType" AS ENUM ('hospital', 'health_center', 'clinic', 'dispensary', 'polyclinic');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('patient', 'facility_admin', 'super_admin');

-- CreateEnum
CREATE TYPE "Language" AS ENUM ('en', 'rw', 'fr');

-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');

-- CreateEnum
CREATE TYPE "InsuranceType" AS ENUM ('public', 'private', 'international');

-- CreateEnum
CREATE TYPE "PlaceType" AS ENUM ('province', 'district', 'sector');

-- CreateEnum
CREATE TYPE "FacilityAdminRole" AS ENUM ('owner', 'editor');

-- CreateTable
CREATE TABLE "appointments" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "facility_id" BIGINT NOT NULL,
    "service_name" VARCHAR(191),
    "appointment_date" TIMESTAMP(3) NOT NULL,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'pending',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "districts" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(191) NOT NULL,
    "name_rw" VARCHAR(191),
    "province_id" BIGINT NOT NULL,

    CONSTRAINT "districts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facility_admins" (
    "id" BIGSERIAL NOT NULL,
    "facility_id" BIGINT NOT NULL,
    "user_id" BIGINT NOT NULL,
    "role" "FacilityAdminRole" NOT NULL DEFAULT 'editor',
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "facility_admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facility_insurances" (
    "id" BIGSERIAL NOT NULL,
    "facility_id" BIGINT NOT NULL,
    "insurance_id" BIGINT NOT NULL,

    CONSTRAINT "facility_insurances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facility_services" (
    "id" BIGSERIAL NOT NULL,
    "facility_id" BIGINT NOT NULL,
    "service_id" BIGINT NOT NULL,
    "is_available" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "facility_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facilities" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(191) NOT NULL,
    "type" "FacilityType" NOT NULL,
    "address" VARCHAR(255),
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "sector_id" BIGINT NOT NULL,
    "phone" VARCHAR(20),
    "email" VARCHAR(191),
    "opening_hours" JSONB,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "facilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "insurance_schemes" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(191) NOT NULL,
    "type" "InsuranceType" NOT NULL,
    "description" TEXT,

    CONSTRAINT "insurance_schemes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "place_centers" (
    "id" BIGSERIAL NOT NULL,
    "place_type" "PlaceType" NOT NULL,
    "place_id" BIGINT NOT NULL,
    "center_lat" DECIMAL(10,8) NOT NULL,
    "center_lng" DECIMAL(11,8) NOT NULL,

    CONSTRAINT "place_centers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provinces" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(191) NOT NULL,
    "name_rw" VARCHAR(191),

    CONSTRAINT "provinces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sectors" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(191) NOT NULL,
    "name_rw" VARCHAR(191),
    "district_id" BIGINT NOT NULL,

    CONSTRAINT "sectors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "services" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(191) NOT NULL,
    "category" VARCHAR(100),
    "description" TEXT,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" BIGSERIAL NOT NULL,
    "full_name" VARCHAR(191) NOT NULL,
    "email" VARCHAR(191) NOT NULL,
    "phone" VARCHAR(20),
    "password" VARCHAR(255) NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'patient',
    "preferred_language" "Language" NOT NULL DEFAULT 'en',
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "fk_district_province" ON "districts"("province_id");

-- CreateIndex
CREATE UNIQUE INDEX "facility_admins_facility_id_user_id_key" ON "facility_admins"("facility_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "facility_insurances_facility_id_insurance_id_key" ON "facility_insurances"("facility_id", "insurance_id");

-- CreateIndex
CREATE UNIQUE INDEX "facility_services_facility_id_service_id_key" ON "facility_services"("facility_id", "service_id");

-- CreateIndex
CREATE INDEX "fk_facility_sector" ON "facilities"("sector_id");

-- CreateIndex
CREATE UNIQUE INDEX "place_centers_place_type_place_id_key" ON "place_centers"("place_type", "place_id");

-- CreateIndex
CREATE INDEX "fk_sector_district" ON "sectors"("district_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "districts" ADD CONSTRAINT "districts_province_id_fkey" FOREIGN KEY ("province_id") REFERENCES "provinces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facility_admins" ADD CONSTRAINT "facility_admins_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facility_admins" ADD CONSTRAINT "facility_admins_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facility_insurances" ADD CONSTRAINT "facility_insurances_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facility_insurances" ADD CONSTRAINT "facility_insurances_insurance_id_fkey" FOREIGN KEY ("insurance_id") REFERENCES "insurance_schemes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facility_services" ADD CONSTRAINT "facility_services_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facility_services" ADD CONSTRAINT "facility_services_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facilities" ADD CONSTRAINT "facilities_sector_id_fkey" FOREIGN KEY ("sector_id") REFERENCES "sectors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sectors" ADD CONSTRAINT "sectors_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "districts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
