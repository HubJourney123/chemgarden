// prisma/seed.js - Database Initialization Script
// ============================================
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create users
  const teacherPassword = await bcrypt.hash('teacher123', 12);
  const assistantPassword = await bcrypt.hash('assistant123', 12);

  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@demo.com' },
    update: {},
    create: {
      email: 'teacher@demo.com',
      password: teacherPassword,
      name: 'Head Teacher',
      role: 'teacher',
    },
  });

  const assistant = await prisma.user.upsert({
    where: { email: 'assistant@demo.com' },
    update: {},
    create: {
      email: 'assistant@demo.com',
      password: assistantPassword,
      name: 'Teaching Assistant',
      role: 'assistant',
    },
  });

  console.log('✅ Users created:', { teacher: teacher.email, assistant: assistant.email });

  // Create sample batches
  const batches = await Promise.all([
    prisma.batch.upsert({
      where: { fullName: 'Physics-sat-9-24' },
      update: {},
      create: {
        name: 'Physics',
        days: 'sat-mon-wed',
        time: '9:00-10:00',
        batchCode: 'SSC-24',
        fullName: 'Physics-sat-9-24',
      },
    }),
    prisma.batch.upsert({
      where: { fullName: 'Chemistry-sun-10-24' },
      update: {},
      create: {
        name: 'Chemistry',
        days: 'sun-tues-thurs',
        time: '10:00-11:00',
        batchCode: 'SSC-24',
        fullName: 'Chemistry-sun-10-24',
      },
    }),
    prisma.batch.upsert({
      where: { fullName: 'Mathematics-sat-2-24' },
      update: {},
      create: {
        name: 'Mathematics',
        days: 'sat-mon-wed',
        time: '2:00-3:30',
        batchCode: 'SSC-24',
        fullName: 'Mathematics-sat-2-24',
      },
    }),
  ]);

  console.log('✅ Batches created:', batches.map(b => b.fullName));

  // Create sample students
  const studentsData = [
    {
      studentId: 'STU2024001',
      name: 'Ahmed Rahman',
      personalNumber: '01712345678',
      guardianNumber: '01812345678',
      college: 'Khulna Public College',
      address: 'Sonadanga, Khulna',
      batchId: batches[0].id,
    },
    {
      studentId: 'STU2024002',
      name: 'Fatima Begum',
      personalNumber: '01723456789',
      guardianNumber: '01823456789',
      college: 'Khulna Public College',
      address: 'Boyra, Khulna',
      batchId: batches[0].id,
    },
    {
      studentId: 'STU2024003',
      name: 'Mehedi Hasan',
      personalNumber: '01734567890',
      guardianNumber: '01834567890',
      college: 'Govt. BL College',
      address: 'Khalishpur, Khulna',
      batchId: batches[1].id,
    },
    {
      studentId: 'STU2024004',
      name: 'Nafisa Akter',
      personalNumber: '01745678901',
      guardianNumber: '01845678901',
      college: 'Govt. MM College',
      address: 'Daulatpur, Khulna',
      batchId: batches[1].id,
    },
    {
      studentId: 'STU2024005',
      name: 'Rakib Hossain',
      personalNumber: '01756789012',
      guardianNumber: '01856789012',
      college: 'Khulna Public College',
      address: 'Nirala, Khulna',
      batchId: batches[2].id,
    },
  ];

  const students = await Promise.all(
    studentsData.map(data =>
      prisma.student.upsert({
        where: { studentId: data.studentId },
        update: {},
        create: data,
      })
    )
  );

  console.log('✅ Students created:', students.length);

  // Create sample payments for current month
  const currentMonth = new Date().toISOString().slice(0, 7);
  const lastMonth = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().slice(0, 7);

  const payments = await Promise.all([
    // Current month payments
    prisma.payment.upsert({
      where: {
        studentId_month: {
          studentId: students[0].id,
          month: currentMonth,
        },
      },
      update: {},
      create: {
        studentId: students[0].id,
        month: currentMonth,
        amount: 1500,
        isPaid: true,
      },
    }),
    prisma.payment.upsert({
      where: {
        studentId_month: {
          studentId: students[1].id,
          month: currentMonth,
        },
      },
      update: {},
      create: {
        studentId: students[1].id,
        month: currentMonth,
        amount: 1500,
        isPaid: true,
      },
    }),
    prisma.payment.upsert({
      where: {
        studentId_month: {
          studentId: students[2].id,
          month: currentMonth,
        },
      },
      update: {},
      create: {
        studentId: students[2].id,
        month: currentMonth,
        amount: 1500,
        isPaid: true,
      },
    }),
    // Last month payments
    prisma.payment.upsert({
      where: {
        studentId_month: {
          studentId: students[0].id,
          month: lastMonth,
        },
      },
      update: {},
      create: {
        studentId: students[0].id,
        month: lastMonth,
        amount: 1500,
        isPaid: true,
      },
    }),
    prisma.payment.upsert({
      where: {
        studentId_month: {
          studentId: students[1].id,
          month: lastMonth,
        },
      },
      update: {},
      create: {
        studentId: students[1].id,
        month: lastMonth,
        amount: 1500,
        isPaid: true,
      },
    }),
  ]);

  console.log('✅ Sample payments created:', payments.length);
  console.log('🎉 Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
