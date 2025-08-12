// src/app/api/students/[id]/route.js
// ============================================
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

// GET single student
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    const student = await prisma.student.findFirst({
      where: {
        OR: [
          { id },
          { studentId: id },
        ],
      },
      include: {
        batch: true,
        payments: {
          orderBy: { month: 'desc' },
        },
      },
    });

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(student);
  } catch (error) {
    console.error('Error fetching student:', error);
    return NextResponse.json(
      { error: 'Failed to fetch student' },
      { status: 500 }
    );
  }
}

// UPDATE student
export async function PUT(request, { params }) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token');
    
    if (!token || !verifyToken(token.value)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const data = await request.json();

    const student = await prisma.student.update({
      where: { id },
      data: {
        name: data.name,
        personalNumber: data.personalNumber,
        guardianNumber: data.guardianNumber,
        college: data.college,
        address: data.address,
        batchId: data.batchId,
      },
      include: {
        batch: true,
      },
    });

    return NextResponse.json(student);
  } catch (error) {
    console.error('Error updating student:', error);
    return NextResponse.json(
      { error: 'Failed to update student' },
      { status: 500 }
    );
  }
}

// DELETE student
export async function DELETE(request, { params }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token');
    
    if (!token || !verifyToken(token.value)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    await prisma.student.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting student:', error);
    return NextResponse.json(
      { error: 'Failed to delete student' },
      { status: 500 }
    );
  }
}
