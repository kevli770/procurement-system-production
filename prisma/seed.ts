// prisma/seed.ts
// Database seeding script for testing

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  console.log('🧹 Cleaning existing data...');
  await prisma.approval.deleteMany();
  await prisma.pOLineItem.deleteMany();
  await prisma.purchaseOrder.deleteMany();
  await prisma.character.deleteMany();
  await prisma.item.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.company.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Existing data cleared');

  // Create Users
  console.log('👤 Creating users...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  const superAdmin = await prisma.user.create({
    data: {
      email: 'superadmin@test.com',
      name: 'Super Admin',
      passwordHash: hashedPassword,
      role: 'SUPER_ADMIN',
      isActive: true,
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: 'admin@test.com',
      name: 'Admin User',
      passwordHash: hashedPassword,
      role: 'ADMIN',
      isActive: true,
    },
  });

  const cfo = await prisma.user.create({
    data: {
      email: 'cfo@test.com',
      name: 'CFO Manager',
      passwordHash: hashedPassword,
      role: 'MANAGER',
      approvalLimit: 1000000,
      isActive: true,
    },
  });

  const manager = await prisma.user.create({
    data: {
      email: 'manager@test.com',
      name: 'Team Manager',
      passwordHash: hashedPassword,
      role: 'MANAGER',
      managerId: cfo.id,
      approvalLimit: 100000,
      isActive: true,
    },
  });

  const user1 = await prisma.user.create({
    data: {
      email: 'user1@test.com',
      name: 'Regular User 1',
      passwordHash: hashedPassword,
      role: 'USER',
      managerId: manager.id,
      isActive: true,
    },
  });

  console.log('✅ Created 5 users');
  console.log('   📧 Email: superadmin@test.com | Password: password123');
  console.log('   📧 Email: manager@test.com | Password: password123');
  console.log('   📧 Email: user1@test.com | Password: password123');

  // Create Companies
  console.log('🏢 Creating companies...');

  const company1 = await prisma.company.create({
    data: { name: 'חברת הבנייה המרכזית', isActive: true },
  });

  const company2 = await prisma.company.create({
    data: { name: 'חברת הטכנולוגיה', isActive: true },
  });

  console.log('✅ Created 2 companies');

  // Create Suppliers
  console.log('🏪 Creating suppliers...');

  const supplier1 = await prisma.supplier.create({
    data: {
      name: 'ספקי משרד בע"מ',
      email: 'office@supplier.com',
      phone: '03-1234567',
      address: 'רחוב הרצל 1, תל אביב',
      isActive: true,
    },
  });

  const supplier2 = await prisma.supplier.create({
    data: {
      name: 'טכנו סחר בע"מ',
      email: 'tech@supplier.com',
      phone: '03-2345678',
      isActive: true,
    },
  });

  console.log('✅ Created 2 suppliers');

  // Create Items
  console.log('📦 Creating catalogue items...');

  const item1 = await prisma.item.create({
    data: {
      sku: 'OFF-001',
      name: 'מחשב נייד Dell',
      description: 'מחשב נייד עסקי',
      suggestedPrice: 4500,
      isActive: true,
    },
  });

  const item2 = await prisma.item.create({
    data: {
      sku: 'OFF-002',
      name: 'מסך מחשב 27 אינץ',
      suggestedPrice: 800,
      isActive: true,
    },
  });

  console.log('✅ Created 2 items');

  // Create Sample PO
  console.log('📝 Creating sample purchase order...');

  await prisma.purchaseOrder.create({
    data: {
      poNumber: 'PO-2025-0001',
      date: new Date(),
      status: 'DRAFT',
      supplierId: supplier1.id,
      companyId: company1.id,
      createdById: user1.id,
      totalAmount: 9800,
      lineItems: {
        create: [
          {
            itemSku: item1.sku!,
            itemName: item1.name,
            itemDescription: item1.description || '',
            unitPrice: item1.suggestedPrice,
            quantity: 2,
            lineTotal: 9000,
            lineNumber: 1,
          },
          {
            itemSku: item2.sku!,
            itemName: item2.name,
            itemDescription: '',
            unitPrice: item2.suggestedPrice,
            quantity: 1,
            lineTotal: 800,
            lineNumber: 2,
          },
        ],
      },
    },
  });

  console.log('✅ Created 1 sample PO');

  console.log('\n✨ Database seeding completed!\n');
  console.log('🔑 Login: superadmin@test.com / password123');
  console.log('🚀 Start testing at http://localhost:3002');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
