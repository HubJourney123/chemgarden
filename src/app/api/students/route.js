// ============================================
// src/app/api/students/route.js
// ============================================
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

// Generate unique student ID
async function generateStudentId() {
  const year = new Date().getFullYear();
  const lastStudent = await prisma.student.findFirst({
    where: {
      studentId: {
        startsWith: `STU${year}`,
      },
    },
    orderBy: {
      studentId: 'desc',
    },
  });

  if (lastStudent) {
    const lastNumber = parseInt(lastStudent.studentId.slice(-3));
    return `STU${year}${String(lastNumber + 1).padStart(3, '0')}`;
  }
  
  return `STU${year}001`;
}

// GET all students with filters
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const batchId = searchParams.get('batchId');
    const search = searchParams.get('search');
    const college = searchParams.get('college');

    const where = {};
    
    if (batchId) {
      where.batchId = batchId;
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { studentId: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    if (college) {
      where.college = { contains: college, mode: 'insensitive' };
    }

    const students = await prisma.student.findMany({
      where,
      include: {
        batch: true,
        payments: {
          orderBy: { month: 'desc' },
          take: 3,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    );
  }
}

// CREATE new student
export async function POST(request) {
  try {
    const cookieStore = await cookies(); // ADD await here
    const token = cookieStore.get('token');
    
    if (!token || !verifyToken(token.value)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const studentId = await generateStudentId();

    const student = await prisma.student.create({
      data: {
        studentId,
        name: data.name,
        personalNumber: data.personalNumber,
        guardianNumber: data.guardianNumber,
        college: data.college || null,
        address: data.address || null,
        batchId: data.batchId,
      },
      include: {
        batch: true,
      },
    });

    return NextResponse.json(student, { status: 201 });
  } catch (error) {
    console.error('Error creating student:', error);
    return NextResponse.json(
      { error: 'Failed to create student' },
      { status: 500 }
    );
  }
}