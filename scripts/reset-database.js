// scripts/reset-database.js
// ============================================
// Use this script to reset your database during development
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function resetDatabase() {
  console.log('🔄 Resetting database...');
  
  try {
    // Delete all data in reverse order of dependencies
    await prisma.payment.deleteMany();
    console.log('✅ Deleted all payments');
    
    await prisma.student.deleteMany();
    console.log('✅ Deleted all students');
    
    await prisma.batch.deleteMany();
    console.log('✅ Deleted all batches');
    
    await prisma.user.deleteMany();
    console.log('✅ Deleted all users');
    
    console.log('🎉 Database reset complete!');
    console.log('Run "npm run prisma:seed" to add sample data');
  } catch (error) {
    console.error('❌ Error resetting database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetDatabase();
