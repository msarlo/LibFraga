import { PrismaClient } from '@/generated/prisma';
import path from 'path';

declare global {
  var prisma: PrismaClient | undefined;
}

const dbPath = path.resolve(process.cwd(), 'prisma', 'dev.db');

export const prisma =
  global.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['error'],
    datasources: {
      db: {
        url: `file:${dbPath}`
      }
    }
  });

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;
