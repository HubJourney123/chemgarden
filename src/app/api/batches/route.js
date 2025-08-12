// src/app/api/batches/route.js
// ============================================
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

// GET all batches
export async function GET() {
  try {
    const batches = await prisma.batch.findMany({
      include: {
        _count: {
          select: { students: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(batches);
  } catch (error) {
    console.error('Error fetching batches:', error);
    return NextResponse.json(
      { error: 'Failed to fetch batches' },
      { status: 500 }
    );
  }
}

// CREATE new batch
export async function POST(request) {
  try {
    const cookieStore = await cookies(); // ADD await here
    const token = cookieStore.get('token');
    
    if (!token || !verifyToken(token.value)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    
    const batch = await prisma.batch.create({
      data: {
        name: data.name,
        days: data.days,
        time: data.time,
        batchCode: data.batchCode,
        fullName: data.fullName,
      },
    });

    return NextResponse.json(batch, { status: 201 });
  } catch (error) {
    console.error('Error creating batch:', error);
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Batch with this name already exists' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create batch' },
      { status: 500 }
    );
  }
}

