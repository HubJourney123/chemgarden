// src/app/api/batches/[id]/route.js
// ============================================
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

// UPDATE batch
export async function PUT(request, { params }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token');
    
    if (!token || !verifyToken(token.value)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const data = await request.json();

    const batch = await prisma.batch.update({
      where: { id },
      data: {
        name: data.name,
        days: data.days,
        time: data.time,
        batchCode: data.batchCode,
        fullName: data.fullName,
      },
    });

    return NextResponse.json(batch);
  } catch (error) {
    console.error('Error updating batch:', error);
    return NextResponse.json(
      { error: 'Failed to update batch' },
      { status: 500 }
    );
  }
}

// DELETE batch
export async function DELETE(request, { params }) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token');
    
    if (!token || !verifyToken(token.value)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    await prisma.batch.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting batch:', error);
    return NextResponse.json(
      { error: 'Failed to delete batch' },
      { status: 500 }
    );
  }
}