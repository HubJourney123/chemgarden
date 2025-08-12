// scripts/create-admin.js
// ============================================
// Use this script to create admin users
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const readline = require('readline');

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function createAdmin() {
  console.log('🔐 Create Admin User\n');
  
  try {
    const email = await question('Email: ');
    const name = await question('Name: ');
    const password = await question('Password: ');
    const role = await question('Role (teacher/assistant): ');
    
    if (!['teacher', 'assistant'].includes(role)) {
      console.error('❌ Invalid role. Must be "teacher" or "assistant"');
      process.exit(1);
    }
    
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role
      }
    });
    
    console.log('\n✅ User created successfully!');
    console.log(`Email: ${user.email}`);
    console.log(`Name: ${user.name}`);
    console.log(`Role: ${user.role}`);
  } catch (error) {
    if (error.code === 'P2002') {
      console.error('❌ User with this email already exists');
    } else {
      console.error('❌ Error creating user:', error.message);
    }
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

createAdmin();
