// ============================================================
// src/config/jwt.ts
// JWT signing / verification config with typed payloads.
// ============================================================

import jwt, { SignOptions, JwtPayload } from 'jsonwebtoken';
import { env } from './env';

export interface JwtAccessPayload extends JwtPayload {
  sub: string;       // user id
  email: string;
  role: string;
}

export interface JwtRefreshPayload extends JwtPayload {
  sub: string;       // user id
  tokenVersion: number;
}

// ---- Sign access token ----
export const signAccessToken = (payload: Omit<JwtAccessPayload, 'iat' | 'exp'>): string => {
  const opts: SignOptions = { expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'] };
  return jwt.sign(payload, env.JWT_SECRET, opts);
};

// ---- Sign refresh token ----
export const signRefreshToken = (payload: Omit<JwtRefreshPayload, 'iat' | 'exp'>): string => {
  const opts: SignOptions = { expiresIn: env.JWT_REFRESH_EXPIRES_IN as SignOptions['expiresIn'] };
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, opts);
};

// ---- Verify access token ----
export const verifyAccessToken = (token: string): JwtAccessPayload => {
  return jwt.verify(token, env.JWT_SECRET) as JwtAccessPayload;
};

// ---- Verify refresh token ----
export const verifyRefreshToken = (token: string): JwtRefreshPayload => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtRefreshPayload;
};

// ---- Decode without verification (for logging) ----
export const decodeToken = (token: string): JwtPayload | null => {
  return jwt.decode(token) as JwtPayload | null;
};
