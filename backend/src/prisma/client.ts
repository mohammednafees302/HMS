// ============================================================
// src/prisma/client.ts
// Singleton Prisma client for Prisma v7 with pg adapter.
// Safe for hot reload in development (ts-node-dev).
// ============================================================

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { env, isDev } from '../config/env';

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

const createPrismaClient = (): PrismaClient => {
  const pool = new Pool({ connectionString: env.DATABASE_URL });
  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log: isDev
      ? ['query', 'info', 'warn', 'error']
      : ['warn', 'error'],
    errorFormat: isDev ? 'pretty' : 'minimal',
  });
};

// ---- Singleton ----
export const prisma: PrismaClient =
  global.__prisma ?? createPrismaClient();

if (isDev) {
  global.__prisma = prisma;
}

// ---- Graceful disconnect ----
export const disconnectPrisma = async (): Promise<void> => {
  await prisma.$disconnect();
};

// ---- DB ping ----
export const pingDatabase = async (): Promise<boolean> => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
};
