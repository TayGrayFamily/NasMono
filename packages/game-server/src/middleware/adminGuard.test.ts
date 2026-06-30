import { describe, it, expect, vi } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { isAdminEnabled, requireAdminEnabled } from './adminGuard.js';

describe('adminGuard', () => {
  it('is disabled in test environment by default', () => {
    expect(isAdminEnabled()).toBe(false);
  });

  it('requireAdminEnabled returns 404 when disabled', () => {
    const req = {} as Request;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;
    const next = vi.fn() as NextFunction;

    requireAdminEnabled(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(next).not.toHaveBeenCalled();
  });
});
