// ============================================================
// src/utils/response.ts
// Standardised API response helpers.
// Every controller uses these so the response shape is
// always consistent.
// ============================================================

import { Response } from 'express';
import { ApiResponse, PaginationMeta, ValidationError } from '../types';

// ---- 200 OK ----
export const sendSuccess = <T>(
  res: Response,
  data: T,
  message = 'Success',
  status = 200,
): Response => {
  const body: ApiResponse<T> = {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
    requestId: res.req.requestId,
  };
  return res.status(status).json(body);
};

// ---- 201 Created ----
export const sendCreated = <T>(
  res: Response,
  data: T,
  message = 'Resource created successfully',
): Response => sendSuccess(res, data, message, 201);

// ---- Paginated 200 ----
export const sendPaginated = <T>(
  res: Response,
  data: T[],
  meta: PaginationMeta,
  message = 'Success',
): Response => {
  const body: ApiResponse<T[]> = {
    success: true,
    message,
    data,
    meta,
    timestamp: new Date().toISOString(),
    requestId: res.req.requestId,
  };
  return res.status(200).json(body);
};

// ---- 4xx / 5xx Errors ----
export const sendError = (
  res: Response,
  message: string,
  status = 500,
  errors?: ValidationError[],
): Response => {
  const body: ApiResponse = {
    success: false,
    message,
    errors,
    timestamp: new Date().toISOString(),
    requestId: res.req.requestId,
  };
  return res.status(status).json(body);
};

// ---- 400 Bad Request ----
export const sendBadRequest = (res: Response, message = 'Bad Request', errors?: ValidationError[]) =>
  sendError(res, message, 400, errors);

// ---- 401 Unauthorized ----
export const sendUnauthorized = (res: Response, message = 'Unauthorized') =>
  sendError(res, message, 401);

// ---- 403 Forbidden ----
export const sendForbidden = (res: Response, message = 'Forbidden') =>
  sendError(res, message, 403);

// ---- 404 Not Found ----
export const sendNotFound = (res: Response, message = 'Resource not found') =>
  sendError(res, message, 404);

// ---- 409 Conflict ----
export const sendConflict = (res: Response, message = 'Conflict') =>
  sendError(res, message, 409);

// ---- 422 Unprocessable ----
export const sendUnprocessable = (res: Response, message = 'Unprocessable Entity', errors?: ValidationError[]) =>
  sendError(res, message, 422, errors);

// ---- Pagination builder ----
export const buildPaginationMeta = (
  page: number,
  limit: number,
  total: number,
): PaginationMeta => {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};
