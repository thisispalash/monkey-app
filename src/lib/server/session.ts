import jwt from 'jsonwebtoken';
import crypto from 'crypto';


/****** Constants ******/

const JWT_SECRET = process.env.JWT_SECRET || 'jwt_secret';
const ACCESS_TOKEN_TTL = '3h';


/****** Types ******/

export type Ingress = 'web' | 'mobile';

export type User = {
  sub: string; // represents the user's uuid
  username: string; // ens name
  ingress: Ingress; // domain logging in from
}

export type ValidToken = { valid: true, user: User & { iat: number, exp: number } };
export type InvalidToken = { valid: false, user: null };


/****** Functions ******/

export function hashRefreshToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export function generateAccessToken(payload: User): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_TTL });
}

export function generateRefreshToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function verifyAccessToken(token: string): ValidToken | InvalidToken {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as User & { iat: number, exp: number };
    return { valid: true, user: decoded };
  } catch {
    return { valid: false, user: null };
  }
}