// src/app/api/payments/route.js
// ============================================
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

// GET payments with filters
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const month = searchParams.get('month');
    const batchId = searchParams.get('batchId');

    const where = {};
    
    if (studentId) {
      where.studentId = studentId;
    }
    
    if (month) {
      where.month = month;
    }
    
    if (batchId) {
      where.student = {
        batchId,
      };
    }

    const payments = await prisma.payment.findMany({
      where,
      include: {
        student: {
          include: {
            batch: true,
          },
        },
      },
      orderBy: { paidAt: 'desc' },
    });

    return NextResponse.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}

// CREATE/UPDATE payment
export async function POST(request) {
  try {
    const cookieStore = await cookies(); // ADD await here
    const token = cookieStore.get('token');
    
    if (!token || !verifyToken(token.value)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    // Upsert payment (create or update)
    const payment = await prisma.payment.upsert({
      where: {
        studentId_month: {
          studentId: data.studentId,
          month: data.month,
        },
      },
      update: {
        amount: data.amount,
        isPaid: true,
        paidAt: new Date(),
      },
      create: {
        studentId: data.studentId,
        month: data.month,
        amount: data.amount,
        isPaid: true,
      },
      include: {
        student: true,
      },
    });

    return NextResponse.json(payment);
  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    );
  }
}
