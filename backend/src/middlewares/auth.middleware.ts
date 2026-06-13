import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';

const authService = new AuthService();

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Authentication token required',
    });
  }

  const token = authHeader.split(' ')[1];
  const user = await authService.verifyToken(token);

  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired session',
    });
  }

  req.user = user;
  req.token = token;
  next();
}
