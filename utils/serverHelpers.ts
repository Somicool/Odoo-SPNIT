import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');
    
    if (!token) {
      return null;
    }
    
    const decoded = jwt.verify(token.value, JWT_SECRET) as any;
    return {
      email: decoded.email,
      name: decoded.name || decoded.email.split('@')[0],
      id: decoded.userId
    };
  } catch (error) {
    return null;
  }
}

export function generateAutoReference(warehouseCode: string, operationType: string, nextId: number): string {
  // Format: WH/IN/001
  return `${warehouseCode}/${operationType}/${String(nextId).padStart(3, '0')}`;
}

export function getCurrentDate(): string {
  return new Date().toISOString().split('T')[0];
}
