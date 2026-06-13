import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/user.repository';
import { SessionRepository } from '../repositories/session.repository';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_fallback_key';
const JWT_EXPIRES_IN = '7d';

export class AuthService {
  private userRepository = new UserRepository();
  private sessionRepository = new SessionRepository();

  async register(email: string, password: string, fullName: string) {
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('Email already registered');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.userRepository.create({
      email,
      passwordHash,
      fullName,
    });

    const token = this.generateToken(user.id, user.email);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await this.sessionRepository.createSession(user.id, token, expiresAt);

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      },
      token,
    };
  }

  async login(email: string, password: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    const token = this.generateToken(user.id, user.email);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await this.sessionRepository.createSession(user.id, token, expiresAt);

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      },
      token,
    };
  }

  async logout(token: string) {
    try {
      await this.sessionRepository.deleteSession(token);
      return true;
    } catch {
      return false;
    }
  }

  async verifyToken(token: string) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
      const session = await this.sessionRepository.findSession(token);
      
      if (!session) {
        return null;
      }

      return {
        id: session.user.id,
        email: session.user.email,
        fullName: session.user.fullName,
      };
    } catch {
      return null;
    }
  }

  private generateToken(userId: string, email: string): string {
    return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  }
}
