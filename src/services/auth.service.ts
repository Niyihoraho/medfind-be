// ─── AUTH SERVICE ────────────────────────────────────────────────
// Business logic for authentication: register, login.

import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma';
import { signToken } from '../lib/jwt';

export const authService = {
  async register(data: {
    full_name: string;
    email: string;
    phone?: string;
    password: string;
    preferred_language?: 'en' | 'rw' | 'fr';
  }) {
    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      throw { status: 409, message: 'Email already registered' };
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        fullName: data.full_name,
        email: data.email,
        phone: data.phone,
        password: hashedPassword,
        role: 'patient',
        preferredLanguage: data.preferred_language || 'en',
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        preferredLanguage: true,
        createdAt: true,
      },
    });

    const token = signToken({ id: Number(user.id), role: user.role });

    return { 
      user: {
        ...user,
        id: Number(user.id)
      }, 
      token 
    };
  },

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw { status: 401, message: 'Invalid email or password' };
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw { status: 401, message: 'Invalid email or password' };
    }

    const token = signToken({ id: Number(user.id), role: user.role });

    const { password: _, ...userWithoutPassword } = user;
    return { 
      user: {
        ...userWithoutPassword,
        id: Number(userWithoutPassword.id)
      }, 
      token 
    };
  },

  async getMe(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: BigInt(userId) },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        preferredLanguage: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw { status: 404, message: 'User not found' };
    }

    return {
      ...user,
      id: Number(user.id)
    };
  },
};
