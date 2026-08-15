import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User.model.js';
import { Staff, IStaff } from '../models/Staff.model.js';
import { env } from '../config/env.js';
import { createAppError } from '../middleware/errorHandler.js';
import { JwtPayload } from '../types/index.js';

const SALT_ROUNDS = 10;

export class AuthService {
  static async registerUser(data: any): Promise<{ user: Partial<IUser>; accessToken: string; refreshToken: string }> {
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      throw createAppError(409, 'email_in_use', 'Email is already registered');
    }

    const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

    const user = new User({
      name: data.name,
      email: data.email,
      passwordHash,
      phone: data.phone,
      preferences: data.preferences,
    });
    await user.save();

    const { accessToken, refreshToken } = this.generateTokens(user.id, 'user');

    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
    };

    return { user: userResponse, accessToken, refreshToken };
  }

  static async loginUser(data: any): Promise<{ user: Partial<IUser>; accessToken: string; refreshToken: string }> {
    const user = await User.findOne({ email: data.email });
    if (!user || !user.passwordHash) {
      throw createAppError(401, 'invalid_credentials', 'Invalid email or password');
    }

    const isMatch = await bcrypt.compare(data.password, user.passwordHash);
    if (!isMatch) {
      throw createAppError(401, 'invalid_credentials', 'Invalid email or password');
    }

    const { accessToken, refreshToken } = this.generateTokens(user.id, 'user');

    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
    };

    return { user: userResponse, accessToken, refreshToken };
  }

  static async registerStaff(data: any): Promise<{ staff: Partial<IStaff>; accessToken: string; refreshToken: string }> {
    const existingStaff = await Staff.findOne({ email: data.email });
    if (existingStaff) {
      throw createAppError(409, 'email_in_use', 'Email is already registered');
    }

    const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

    const staff = new Staff({
      name: data.name,
      email: data.email,
      passwordHash,
      role: data.role,
    });
    await staff.save();

    const { accessToken, refreshToken } = this.generateTokens(staff.id, 'staff', staff.role);

    const staffResponse = {
      id: staff.id,
      name: staff.name,
      email: staff.email,
      role: staff.role,
    };

    return { staff: staffResponse, accessToken, refreshToken };
  }

  static async loginStaff(data: any): Promise<{ staff: Partial<IStaff>; accessToken: string; refreshToken: string }> {
    const staff = await Staff.findOne({ email: data.email });
    if (!staff || !staff.passwordHash) {
      throw createAppError(401, 'invalid_credentials', 'Invalid email or password');
    }

    const isMatch = await bcrypt.compare(data.password, staff.passwordHash);
    if (!isMatch) {
      throw createAppError(401, 'invalid_credentials', 'Invalid email or password');
    }

    const { accessToken, refreshToken } = this.generateTokens(staff.id, 'staff', staff.role);

    const staffResponse = {
      id: staff.id,
      name: staff.name,
      email: staff.email,
      role: staff.role,
    };

    return { staff: staffResponse, accessToken, refreshToken };
  }

  static refreshToken(token: string): { accessToken: string; refreshToken: string } {
    try {
      const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload;
      if (decoded.type !== 'refresh') {
        throw new Error('Not a refresh token');
      }
      return this.generateTokens(decoded.sub, decoded.accountType, decoded.role);
    } catch (error) {
      throw createAppError(401, 'invalid_token', 'Invalid or expired refresh token');
    }
  }

  private static generateTokens(userId: string, accountType: 'user' | 'staff', role?: string): { accessToken: string; refreshToken: string } {
    const accessPayload: JwtPayload = { sub: userId, accountType, role: role as any, type: 'access' };
    const refreshPayload: JwtPayload = { sub: userId, accountType, role: role as any, type: 'refresh' };
    
    const accessToken = jwt.sign(accessPayload, env.JWT_ACCESS_SECRET, {
      expiresIn: env.JWT_ACCESS_TTL as any,
    });
    
    const refreshToken = jwt.sign(refreshPayload, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_TTL as any,
    });

    return { accessToken, refreshToken };
  }
}
