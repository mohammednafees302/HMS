// ============================================================
// src/utils/bcrypt.ts
// bcrypt helpers — hash and compare passwords.
// ============================================================

import bcrypt from 'bcrypt';
import { env } from '../config/env';

/**
 * Hash a plain-text password.
 * Salt rounds come from BCRYPT_ROUNDS env variable.
 */
export const hashPassword = async (plainText: string): Promise<string> => {
  return bcrypt.hash(plainText, env.BCRYPT_ROUNDS);
};

/**
 * Compare a plain-text password against a stored hash.
 * Returns true if they match.
 */
export const comparePassword = async (
  plainText: string,
  hash: string,
): Promise<boolean> => {
  return bcrypt.compare(plainText, hash);
};
