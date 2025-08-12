// scripts/monthly-report.js
// ============================================
// Use this script to generate monthly reports
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function generateMonthlyReport(month = null) {
  const reportMonth = month || new Date().toISOString().slice(0, 7);
  console.log(`📊 Generating report for ${reportMonth}...`);
  
  try {
    // Fetch all relevant data
    const [students, batches, payments] = await Promise.all([
      prisma.student.findMany({
        include: {
          batch: true,
          payments: {
            where: { month: reportMonth }
          }
        }
      }),
      prisma.batch.findMany({
        include: {
          students: {
            include: {
              payments: {
                where: { month: reportMonth }
              }
            }
          }
        }
      }),
      prisma.payment.findMany({
        where: { month: reportMonth },
        include: {
          student: {
            include: { batch: true }
          }
        }
      })
    ]);
    
    // Calculate statistics
    const totalStudents = students.length;
    const paidStudents = new Set(payments.map(p => p.studentId)).size;
    const unpaidStudents = totalStudents - paidStudents;
    const totalCollection = payments.reduce((sum, p) => sum + p.amount, 0);
    
    // Batch-wise analysis
    const batchAnalysis = batches.map(batch => {
      const batchPayments = payments.filter(p => p.student.batchId === batch.id);
      const batchStudentCount = batch.students.length;
      const batchPaidCount = new Set(batchPayments.map(p => p.studentId)).size;
      const batchCollection = batchPayments.reduce((sum, p) => sum + p.amount, 0);
      
      return {
        batchName: batch.fullName,
        totalStudents: batchStudentCount,
        paidStudents: batchPaidCount,
        unpaidStudents: batchStudentCount - batchPaidCount,
        totalCollection: batchCollection,
        collectionRate: batchStudentCount > 0 
          ? ((batchPaidCount / batchStudentCount) * 100).toFixed(2) + '%'
          : '0%'
      };
    });
    
    // Generate report
    const report = {
      month: reportMonth,
      generatedAt: new Date().toISOString(),
      summary: {
        totalStudents,
        paidStudents,
        unpaidStudents,
        totalCollection,
        collectionRate: totalStudents > 0 
          ? ((paidStudents / totalStudents) * 100).toFixed(2) + '%'
          : '0%'
      },
      batchAnalysis,
      unpaidStudentsList: students
        .filter(s => !s.payments.length)
        .map(s => ({
          id: s.studentId,
          name: s.name,
          batch: s.batch.fullName,
          personalNumber: s.personalNumber,
          guardianNumber: s.guardianNumber
        }))
    };
    
    // Save report
    const reportsDir = path.join(process.cwd(), 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir);
    }
    
    const filename = `report-${reportMonth}.json`;
    const filepath = path.join(reportsDir, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(report, null, 2));
    
    // Print summary
    console.log('\n📈 MONTHLY REPORT SUMMARY');
    console.log('=' .repeat(40));
    console.log(`Month: ${reportMonth}`);
    console.log(`Total Students: ${totalStudents}`);
    console.log(`Paid Students: ${paidStudents}`);
    console.log(`Unpaid Students: ${unpaidStudents}`);
    console.log(`Total Collection: ৳${totalCollection}`);
    console.log(`Collection Rate: ${report.summary.collectionRate}`);
    console.log('=' .repeat(40));
    console.log('\n📊 BATCH-WISE ANALYSIS:');
    
    batchAnalysis.forEach(batch => {
      console.log(`\n${batch.batchName}:`);
      console.log(`  Students: ${batch.totalStudents}`);
      console.log(`  Paid: ${batch.paidStudents}`);
      console.log(`  Collection: ৳${batch.totalCollection}`);
      console.log(`  Rate: ${batch.collectionRate}`);
    });
    
    console.log(`\n✅ Report saved to: ${filepath}`);
  } catch (error) {
    console.error('❌ Error generating report:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Get month from command line argument
const month = process.argv[2];
generateMonthlyReport(month);
