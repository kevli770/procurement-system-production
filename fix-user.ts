// Quick script to check and fix user session issue
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Get all users
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true },
  });

  console.log('\n=== All Users in Database ===');
  users.forEach(user => {
    console.log(`ID: ${user.id}`);
    console.log(`Email: ${user.email}`);
    console.log(`Name: ${user.name}`);
    console.log(`Role: ${user.role}`);
    console.log('---');
  });

  // Check if the session user exists
  const sessionUserId = 'cmgz9y71f0000fa6wnxsw9zsn';
  const sessionUser = await prisma.user.findUnique({
    where: { id: sessionUserId },
  });

  console.log(`\n=== Session User (${sessionUserId}) ===`);
  console.log(sessionUser ? 'EXISTS' : 'NOT FOUND');

  // Get all sessions
  const sessions = await prisma.session.findMany({
    select: { id: true, userId: true, sessionToken: true },
  });

  console.log('\n=== All Sessions ===');
  sessions.forEach(session => {
    console.log(`Session Token: ${session.sessionToken.substring(0, 20)}...`);
    console.log(`User ID: ${session.userId}`);
    console.log('---');
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
