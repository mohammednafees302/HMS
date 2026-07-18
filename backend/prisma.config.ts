// ============================================================
// prisma/prisma.config.ts
// Prisma v7 configuration — connection URL passed here.
// ============================================================

import path from 'path';
import { defineConfig } from 'prisma/config';
import dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '.env') });

export default defineConfig({
  earlyAccess: true,
  schema: path.join(__dirname, 'prisma/schema.prisma'),
  datasource: {
    url: process.env['DIRECT_URL'],
  },
});
