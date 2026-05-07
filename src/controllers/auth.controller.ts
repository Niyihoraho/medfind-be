// ─── AUTH CONTROLLER ─────────────────────────────────────────────

import { Request, Response } from 'express';
import { authService } from '../services/auth.service';

export const authController = {
  async register(req: Request, res: Response) {
    try {
      const result = await authService.register(req.body);
      res.status(201).json({ success: true, data: result, message: 'Registration successful' });
    } catch (err: any) {
      console.error('❌ Registration error:', err);
      res.status(err.status || 500).json({ 
        success: false, 
        error: err.message || 'Internal server error', 
        code: err.status || 500 
      });
    }
  },

  async login(req: Request, res: Response) {
    try {
      const result = await authService.login(req.body.email, req.body.password);
      res.json({ success: true, data: result, message: 'Login successful' });
    } catch (err: any) {
      console.error('❌ Login error:', err);
      res.status(err.status || 500).json({ 
        success: false, 
        error: err.message || 'Internal server error', 
        code: err.status || 500 
      });
    }
  },

  async logout(_req: Request, res: Response) {
    // JWT logout is client-side (remove token)
    res.json({ success: true, data: null, message: 'Logged out successfully' });
  },

  async me(req: Request, res: Response) {
    try {
      const user = await authService.getMe(req.user!.id);
      res.json({ success: true, data: user, message: 'User profile retrieved' });
    } catch (err: any) {
      res.status(err.status || 500).json({ success: false, error: err.message, code: err.status || 500 });
    }
  },
};
