// src/app/api/stats/route.js (FIXED VERSION)
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    // Check for token
    const cookieStore = await cookies(); // Use await for Next.js 15
    const token = cookieStore.get('token');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month') || new Date().toISOString().slice(0, 7);

    // Get all statistics
    const [totalStudents, totalBatches, monthlyPayments, allStudents] = await Promise.all([
      prisma.student.count(),
      prisma.batch.count(),
      prisma.payment.findMany({
        where: { month },
        include: { student: true },
      }),
      prisma.student.findMany({
        include: {
          payments: {
            where: { month },
          },
        },
      }),
    ]);

    // Calculate monthly collection
    const monthlyCollection = monthlyPayments.reduce((sum, p) => sum + p.amount, 0);
    
    // Calculate who has paid - using Set to get unique student IDs
    const paidStudentIds = new Set(monthlyPayments.map(p => p.studentId));
    const paidStudentsCount = paidStudentIds.size;
    
    // Calculate pending payments
    const pendingPayments = totalStudents - paidStudentsCount;
    
    // Calculate collection rate correctly
    const collectionRate = totalStudents > 0 
      ? Math.round((paidStudentsCount / totalStudents) * 100)
      : 0;

    console.log('Stats calculation:', {
      totalStudents,
      paidStudentsCount,
      pendingPayments,
      collectionRate,
      month
    });

    return NextResponse.json({
      totalStudents,
      totalBatches,
      monthlyCollection,
      pendingPayments,
      paidStudentsCount, // Add this for clarity
      collectionRate, // Add this directly
      currentMonth: month,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}