/**
 * Express Request augmentation — adds req.user after authenticate() runs.
 *
 * Placed here so TypeScript picks it up globally via typeRoots / includes.
 */
import { AuthUser } from './auth.types.js';

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export {};
