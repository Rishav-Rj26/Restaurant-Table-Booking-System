import { Request } from 'express';
import { AccountType, StaffRole } from '../config/constants.js';

/**
 * Payload stored inside every signed JWT.
 */
export interface JwtPayload {
  /** MongoDB ObjectId string */
  sub: string;
  /** "user" for diners, "staff" for owners/managers/hosts */
  accountType: AccountType;
  /** Only present for staff tokens */
  role?: StaffRole;
  /** Token type guard */
  type: 'access' | 'refresh';
}

/**
 * What req.user looks like after authenticate() middleware runs.
 */
export interface AuthUser {
  id: string;
  accountType: AccountType;
  role?: StaffRole;
}

/**
 * Express Request augmented with the parsed auth principal.
 */
export interface AuthRequest extends Request {
  user: AuthUser;
}

/**
 * Shape returned by every auth endpoint that issues tokens.
 */
export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

/**
 * Shape of the user/staff object returned in auth responses (safe — no passwordHash).
 */
export interface SafeUser {
  id: string;
  name: string;
  email: string;
  accountType: 'user';
}

export interface SafeStaff {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  restaurants: string[];
  accountType: 'staff';
}
