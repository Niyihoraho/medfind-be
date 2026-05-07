// ─── MEDFIND SEED DATA ───────────────────────────────────────────
// Seeds Rwanda administrative geography, services, insurance schemes,
// demo facilities, and a super admin user.

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Cleaning database...');
  await prisma.facilityInsurance.deleteMany();
  await prisma.facilityService.deleteMany();
  await prisma.facility.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.insuranceScheme.deleteMany();
  await prisma.service.deleteMany();
  await prisma.placeCenter.deleteMany();
  await prisma.village.deleteMany();
  await prisma.cell.deleteMany();
  await prisma.sector.deleteMany();
  await prisma.district.deleteMany();
  await prisma.province.deleteMany();
  await prisma.user.deleteMany({ where: { role: { not: 'super_admin' } } }); // Keep admins or clear all
  await prisma.user.deleteMany(); // Clear all for a fresh start

  console.log('🌱 Seeding MEDFIND database...\n');

  // ─── 1. PROVINCES ────────────────────────────────────────────
  const provinces = await Promise.all([
    prisma.province.create({ data: { name: 'Kigali City', nameRw: 'Umujyi wa Kigali' } }),
    prisma.province.create({ data: { name: 'Northern Province', nameRw: 'Intara y\'Amajyaruguru' } }),
    prisma.province.create({ data: { name: 'Southern Province', nameRw: 'Intara y\'Amajyepfo' } }),
    prisma.province.create({ data: { name: 'Eastern Province', nameRw: 'Intara y\'Iburasirazuba' } }),
    prisma.province.create({ data: { name: 'Western Province', nameRw: 'Intara y\'Iburengerazuba' } }),
  ]);
  console.log(`✅ Created ${provinces.length} provinces`);

  const [kigali, northern, southern, eastern, western] = provinces;

  // ─── 2. DISTRICTS ────────────────────────────────────────────
  const districts = await Promise.all([
    // Kigali City
    prisma.district.create({ data: { name: 'Gasabo', nameRw: 'Gasabo', provinceId: kigali.id } }),
    prisma.district.create({ data: { name: 'Kicukiro', nameRw: 'Kicukiro', provinceId: kigali.id } }),
    prisma.district.create({ data: { name: 'Nyarugenge', nameRw: 'Nyarugenge', provinceId: kigali.id } }),
    // Northern
    prisma.district.create({ data: { name: 'Musanze', nameRw: 'Musanze', provinceId: northern.id } }),
    prisma.district.create({ data: { name: 'Burera', nameRw: 'Burera', provinceId: northern.id } }),
    // Southern
    prisma.district.create({ data: { name: 'Huye', nameRw: 'Huye', provinceId: southern.id } }),
    prisma.district.create({ data: { name: 'Muhanga', nameRw: 'Muhanga', provinceId: southern.id } }),
    // Eastern
    prisma.district.create({ data: { name: 'Rwamagana', nameRw: 'Rwamagana', provinceId: eastern.id } }),
    prisma.district.create({ data: { name: 'Kayonza', nameRw: 'Kayonza', provinceId: eastern.id } }),
    // Western
    prisma.district.create({ data: { name: 'Rubavu', nameRw: 'Rubavu', provinceId: western.id } }),
    prisma.district.create({ data: { name: 'Rusizi', nameRw: 'Rusizi', provinceId: western.id } }),
  ]);
  console.log(`✅ Created ${districts.length} districts`);

  const [gasabo, kicukiro, nyarugenge, musanze] = districts;

  // ─── 3. SECTORS ──────────────────────────────────────────────
  const sectors = await Promise.all([
    // Gasabo
    prisma.sector.create({ data: { name: 'Kacyiru', nameRw: 'Kacyiru', districtId: gasabo.id } }),
    prisma.sector.create({ data: { name: 'Kimironko', nameRw: 'Kimironko', districtId: gasabo.id } }),
    prisma.sector.create({ data: { name: 'Remera', nameRw: 'Remera', districtId: gasabo.id } }),
    prisma.sector.create({ data: { name: 'Kimihurura', nameRw: 'Kimihurura', districtId: gasabo.id } }),
    // Kicukiro
    prisma.sector.create({ data: { name: 'Gikondo', nameRw: 'Gikondo', districtId: kicukiro.id } }),
    prisma.sector.create({ data: { name: 'Niboye', nameRw: 'Niboye', districtId: kicukiro.id } }),
    // Nyarugenge
    prisma.sector.create({ data: { name: 'Nyarugenge', nameRw: 'Nyarugenge', districtId: nyarugenge.id } }),
    prisma.sector.create({ data: { name: 'Gitega', nameRw: 'Gitega', districtId: nyarugenge.id } }),
    // Musanze
    prisma.sector.create({ data: { name: 'Muhoza', nameRw: 'Muhoza', districtId: musanze.id } }),
  ]);
  console.log(`✅ Created ${sectors.length} sectors`);

  const [kacyiru, kimironko, remera, kimihurura, gikondo] = sectors;

  // ─── 3.1 CELLS ──────────────────────────────────────────────
  const cells = await Promise.all([
    // Kacyiru
    prisma.cell.create({ data: { name: 'Kamatamu', nameRw: 'Kamatamu', sectorId: kacyiru.id } }),
    prisma.cell.create({ data: { name: 'Kibaza', nameRw: 'Kibaza', sectorId: kacyiru.id } }),
    // Kimironko
    prisma.cell.create({ data: { name: 'Kibagabaga', nameRw: 'Kibagabaga', sectorId: kimironko.id } }),
    prisma.cell.create({ data: { name: 'Nyagatovu', nameRw: 'Nyagatovu', sectorId: kimironko.id } }),
  ]);
  console.log(`✅ Created ${cells.length} cells`);

  const [kamatamu, kibaza, kibagabagaCell] = cells;

  // ─── 3.2 VILLAGES ────────────────────────────────────────────
  const villages = await Promise.all([
    // Kamatamu
    prisma.village.create({ data: { name: 'Inyange', nameRw: 'Inyange', cellId: kamatamu.id } }),
    prisma.village.create({ data: { name: 'Umuco', nameRw: 'Umuco', cellId: kamatamu.id } }),
    // Kibaza
    prisma.village.create({ data: { name: 'Ihuriro', nameRw: 'Ihuriro', cellId: kibaza.id } }),
    // Kibagabaga
    prisma.village.create({ data: { name: 'Gasharu', nameRw: 'Gasharu', cellId: kibagabagaCell.id } }),
  ]);
  console.log(`✅ Created ${villages.length} villages`);

  const [inyange, , , gasharu] = villages;

  // ─── 4. PLACE CENTERS ────────────────────────────────────────
  const placeCenters = await Promise.all([
    prisma.placeCenter.create({ data: { placeType: 'sector', placeId: kacyiru.id, centerLat: -1.9441, centerLng: 29.8674 } }),
    prisma.placeCenter.create({ data: { placeType: 'sector', placeId: kimironko.id, centerLat: -1.9400, centerLng: 30.0900 } }),
    prisma.placeCenter.create({ data: { placeType: 'sector', placeId: remera.id, centerLat: -1.9566, centerLng: 30.0944 } }),
    prisma.placeCenter.create({ data: { placeType: 'sector', placeId: kimihurura.id, centerLat: -1.9506, centerLng: 30.0723 } }),
    prisma.placeCenter.create({ data: { placeType: 'sector', placeId: gikondo.id, centerLat: -1.9742, centerLng: 30.0700 } }),
    // Province centers
    prisma.placeCenter.create({ data: { placeType: 'province', placeId: kigali.id, centerLat: -1.9536, centerLng: 30.0606 } }),
    prisma.placeCenter.create({ data: { placeType: 'province', placeId: northern.id, centerLat: -1.5005, centerLng: 29.6340 } }),
    prisma.placeCenter.create({ data: { placeType: 'province', placeId: southern.id, centerLat: -2.5967, centerLng: 29.7394 } }),
    // District centers
    prisma.placeCenter.create({ data: { placeType: 'district', placeId: gasabo.id, centerLat: -1.9403, centerLng: 30.0850 } }),
    prisma.placeCenter.create({ data: { placeType: 'district', placeId: kicukiro.id, centerLat: -1.9742, centerLng: 30.0700 } }),
  ]);
  console.log(`✅ Created ${placeCenters.length} place centers`);

  // ─── 5. SERVICES ─────────────────────────────────────────────
  const services = await Promise.all([
    prisma.service.create({ data: { name: 'Emergency Care', category: 'Emergency', description: '24/7 emergency medical services' } }),
    prisma.service.create({ data: { name: 'Maternity', category: 'Obstetrics', description: 'Prenatal, delivery, and postnatal care' } }),
    prisma.service.create({ data: { name: 'Laboratory', category: 'Diagnostics', description: 'Blood tests, urinalysis, and pathology' } }),
    prisma.service.create({ data: { name: 'Pharmacy', category: 'Pharmacy', description: 'Prescription and over-the-counter medications' } }),
    prisma.service.create({ data: { name: 'Dental', category: 'Dental', description: 'General and specialist dental care' } }),
    prisma.service.create({ data: { name: 'Radiology', category: 'Diagnostics', description: 'X-ray, CT scan, MRI, and ultrasound' } }),
    prisma.service.create({ data: { name: 'Surgery', category: 'Surgery', description: 'General and specialist surgical procedures' } }),
    prisma.service.create({ data: { name: 'Pediatrics', category: 'Pediatrics', description: 'Healthcare for children and adolescents' } }),
    prisma.service.create({ data: { name: 'Outpatient Consultation', category: 'General', description: 'Walk-in and scheduled consultations' } }),
    prisma.service.create({ data: { name: 'Blood Bank', category: 'Diagnostics', description: 'Blood donation and transfusion services' } }),
  ]);
  console.log(`✅ Created ${services.length} services`);

  // ─── 6. INSURANCE SCHEMES ────────────────────────────────────
  const insurances = await Promise.all([
    prisma.insuranceScheme.create({ data: { name: 'RAMA', type: 'public', description: 'Rwanda Medical Insurance for public servants' } }),
    prisma.insuranceScheme.create({ data: { name: 'MMI', type: 'public', description: 'Military Medical Insurance' } }),
    prisma.insuranceScheme.create({ data: { name: 'Mutuelle de Santé', type: 'public', description: 'Community-based health insurance for all Rwandans' } }),
    prisma.insuranceScheme.create({ data: { name: 'Private Insurance', type: 'private', description: 'Generic private health insurance plans' } }),
    prisma.insuranceScheme.create({ data: { name: 'Travel Insurance', type: 'international', description: 'International travel and visitor health insurance' } }),
    prisma.insuranceScheme.create({ data: { name: 'Out-of-Pocket', type: 'private', description: 'No insurance — direct payment by patient' } }),
  ]);
  console.log(`✅ Created ${insurances.length} insurance schemes`);

  const [rama, mmi, mutuelle, privateIns, travelIns] = insurances;

  // ─── 7. ORGANIZATIONS ────────────────────────────────────────
  const orgs = await Promise.all([
    prisma.organization.create({ 
      data: { 
        name: 'Ministry of Health', 
        ownershipType: 'public'
      } 
    }),
    prisma.organization.create({ 
      data: { 
        name: 'IHS - International Healthcare Solutions', 
        ownershipType: 'private'
      } 
    }),
  ]);
  console.log(`✅ Created ${orgs.length} organizations`);

  const [moh, ihs] = orgs;

  // ─── 8. DEMO FACILITIES ──────────────────────────────────────
  const facility1 = await prisma.facility.create({
    data: {
      name: 'King Faisal Hospital',
      type: 'hospital',
      category: 'private',
      organizationId: ihs.id,
      isPartner: true,
      imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=800',
      address: 'KG 544 St, Kigali',
      latitude: -1.9441,
      longitude: 29.8674,
      sectorId: kacyiru.id,
      cellId: kamatamu.id,
      villageId: inyange.id,
      phone: '+250 788 123 456',
      email: 'info@kfh.rw',
      openingHours: { mon: '00:00-23:59', tue: '00:00-23:59', wed: '00:00-23:59', thu: '00:00-23:59', fri: '00:00-23:59', sat: '00:00-23:59', sun: '00:00-23:59', emergency: '24/7' },
      isVerified: true,
    },
  });

  const facility2 = await prisma.facility.create({
    data: {
      name: 'CHUK - Centre Hospitalier Universitaire de Kigali',
      type: 'hospital',
      category: 'public',
      organizationId: moh.id,
      isPartner: false,
      imageUrl: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?q=80&w=800',
      address: 'KN 4 Ave, Kigali',
      latitude: -1.9566,
      longitude: 30.0594,
      sectorId: remera.id,
      phone: '+250 788 234 567',
      email: 'info@chuk.rw',
      openingHours: { mon: '00:00-23:59', tue: '00:00-23:59', wed: '00:00-23:59', thu: '00:00-23:59', fri: '00:00-23:59', sat: '00:00-23:59', sun: '00:00-23:59', emergency: '24/7' },
      isVerified: true,
    },
  });

  const facility3 = await prisma.facility.create({
    data: {
      name: 'Kibagabaga District Hospital',
      type: 'hospital',
      category: 'public',
      organizationId: moh.id,
      isPartner: true,
      imageUrl: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?q=80&w=800',
      address: 'KG 17 Ave, Kigali',
      latitude: -1.9352,
      longitude: 30.1010,
      sectorId: kimironko.id,
      cellId: kibagabagaCell.id,
      villageId: gasharu.id,
      phone: '+250 788 345 678',
      email: 'info@kibagabaga.rw',
      openingHours: { mon: '07:00-20:00', tue: '07:00-20:00', wed: '07:00-20:00', thu: '07:00-20:00', fri: '07:00-20:00', sat: '08:00-14:00', sun: 'closed', emergency: '24/7' },
      isVerified: true,
    },
  });
  console.log(`✅ Created 3 demo facilities`);

  // ─── 8. ASSIGN SERVICES TO FACILITIES ────────────────────────
  // King Faisal: all services
  for (const svc of services) {
    await prisma.facilityService.create({
      data: { facilityId: facility1.id, serviceId: svc.id, isAvailable: true },
    });
  }

  // CHUK: most services
  for (const svc of services.slice(0, 8)) {
    await prisma.facilityService.create({
      data: { facilityId: facility2.id, serviceId: svc.id, isAvailable: true },
    });
  }

  // Kibagabaga: basic services
  for (const svc of [services[0], services[2], services[3], services[7], services[8]]) {
    await prisma.facilityService.create({
      data: { facilityId: facility3.id, serviceId: svc.id, isAvailable: true },
    });
  }
  console.log(`✅ Assigned services to facilities`);

  // ─── 9. ASSIGN INSURANCES TO FACILITIES ──────────────────────
  // King Faisal: all insurances
  for (const ins of insurances) {
    await prisma.facilityInsurance.create({
      data: { facilityId: facility1.id, insuranceId: ins.id },
    });
  }

  // CHUK: public + private
  for (const ins of [rama, mmi, mutuelle, privateIns]) {
    await prisma.facilityInsurance.create({
      data: { facilityId: facility2.id, insuranceId: ins.id },
    });
  }

  // Kibagabaga: public only
  for (const ins of [rama, mutuelle]) {
    await prisma.facilityInsurance.create({
      data: { facilityId: facility3.id, insuranceId: ins.id },
    });
  }
  console.log(`✅ Assigned insurance schemes to facilities`);

  // ─── 10. SUPER ADMIN USER ────────────────────────────────────
  const hashedPassword = await bcrypt.hash('Admin@1234', 12);
  const admin = await prisma.user.create({
    data: {
      fullName: 'MEDFIND Admin',
      email: 'admin@medfind.rw',
      password: hashedPassword,
      role: 'super_admin',
      preferredLanguage: 'en',
    },
  });
  console.log(`✅ Created super admin: ${admin.email}`);

  console.log('\n🎉 Seeding complete!\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
