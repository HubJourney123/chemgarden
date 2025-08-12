// ============================================
// src/app/api/auth/logout/route.js (FIXED VERSION)
// ============================================
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  const cookieStore = await cookies(); // ADD await here
  const response = NextResponse.json({ success: true });
  
  // Clear the token cookie
  cookieStore.delete('token');
  
  return response;
}
