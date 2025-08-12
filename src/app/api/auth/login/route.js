// OPTION 1: UPDATE COOKIE SETTINGS (QUICKEST FIX)
// src/app/api/auth/login/route.js
// ============================================
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyPassword, generateToken } from '@/lib/auth';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    console.log('Login attempt for:', email);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log('User not found:', email);
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      console.log('Invalid password for:', email);
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Generate token
    const token = generateToken(user.id, user.role);

    console.log('Login successful for:', email, 'Role:', user.role);

    // Create response
    const response = NextResponse.json({
      success: true,
      role: user.role,
      name: user.name,
      email: user.email,
    });

    // Set cookie WITHOUT httpOnly so JavaScript can read it
    // Note: This is less secure but will work for development
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: false,  // CHANGED TO FALSE
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    // Also set a role cookie for easy checking
    response.cookies.set({
      name: 'userRole',
      value: user.role,
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}