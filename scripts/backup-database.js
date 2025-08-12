// scripts/backup-database.js
// ============================================
// Use this script to backup your database data to JSON
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function backupDatabase() {
  console.log('💾 Starting database backup...');
  
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(process.cwd(), 'backups');
    
    // Create backups directory if it doesn't exist
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir);
    }
    
    // Fetch all data
    const [users, batches, students, payments] = await Promise.all([
      prisma.user.findMany(),
      prisma.batch.findMany(),
      prisma.student.findMany(),
      prisma.payment.findMany()
    ]);
    
    // Create backup object
    const backup = {
      timestamp: new Date().toISOString(),
      data: {
        users: users.map(u => ({ ...u, password: '[ENCRYPTED]' })), // Don't backup passwords
        batches,
        students,
        payments
      },
      counts: {
        users: users.length,
        batches: batches.length,
        students: students.length,
        payments: payments.length
      }
    };
    
    // Save to file
    const filename = `backup-${timestamp}.json`;
    const filepath = path.join(backupDir, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(backup, null, 2));
    
    console.log('✅ Backup completed successfully!');
    console.log(`📁 File saved: ${filepath}`);
    console.log(`📊 Stats:`, backup.counts);
  } catch (error) {
    console.error('❌ Error creating backup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

backupDatabase();