import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { readAdmins } from './data.js';

// JWT secret - in production, use an environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'altepost_jwt_secret_key_2024';

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + 'altepost_salt').digest('hex');
}

export async function authenticateAdmin(username: string, password: string): Promise<{ id: number; username: string } | null> {
  const admins = await readAdmins();
  const hashedPassword = hashPassword(password);
  const admin = admins.find((a: any) => a.username === username && a.password === hashedPassword);
  return admin ? { id: admin.id, username: admin.username } : null;
}

export function createSession(adminId: number, username: string): string {
  // Create a JWT token instead of storing session in memory
  const token = jwt.sign(
    { adminId, username },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
  return token;
}

export function validateSession(sessionId: string): { adminId: number; username: string } | null {
  try {
    const decoded = jwt.verify(sessionId, JWT_SECRET) as { adminId: number; username: string };
    return { adminId: decoded.adminId, username: decoded.username };
  } catch (e) {
    return null;
  }
}

export function destroySession(sessionId: string): void {
  // With JWT, logout is handled client-side by removing the token
  // For production, you could add the token to a blacklist in a database
}
