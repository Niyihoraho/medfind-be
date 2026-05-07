import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding admin users...');
  
  const email = process.env.SUPER_ADMIN_EMAIL || 'admin@medfind.rw';
  const password = process.env.SUPER_ADMIN_PASSWORD || 'Admin@1234';
  
  const hashedPassword = await bcrypt.hash(password, 12);
  
  // 1. Super Admin
  const admin = await prisma.user.upsert({
    where: { email },
    update: { password: hashedPassword }, // Ensure password is correct
    create: {
      fullName: 'MEDFIND Super Admin',
      email,
      password: hashedPassword,
      role: 'super_admin',
      preferredLanguage: 'en',
    },
  });
  console.log(`✅ Super Admin ready: ${admin.email}`);

  // 2. Facility Admin
  const facAdmin = await prisma.user.upsert({
    where: { email: 'facility@medfind.rw' },
    update: { password: hashedPassword }, // Ensure password is correct
    create: {
      fullName: 'Facility Manager',
      email: 'facility@medfind.rw',
      password: hashedPassword,
      role: 'facility_admin',
      preferredLanguage: 'en',
    },
  });
  console.log(`✅ Facility Admin ready: ${facAdmin.email} / Admin@1234`);
  
  // Assign the facility admin to a facility if any exist
  const facility = await prisma.facility.findFirst();
  if (facility) {
    // Check if assignment exists
    const existingAdmin = await prisma.facilityAdmin.findFirst({
      where: { facilityId: facility.id, userId: facAdmin.id }
    });
    
    if (!existingAdmin) {
      await prisma.facilityAdmin.create({
        data: {
          facilityId: facility.id,
          userId: facAdmin.id,
          role: 'owner'
        }
      });
      console.log(`✅ Assigned Facility Admin to facility: ${facility.name}`);
    } else {
      console.log(`✅ Facility Admin is already assigned to: ${facility.name}`);
    }
  } else {
    console.log(`⚠️ No facilities found in DB. You'll need to create one as Super Admin and assign this user.`);
  }
}

main()
  .catch((e) => {
    console.error('❌ Error seeding users:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
