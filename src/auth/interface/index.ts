import { Request } from 'express';
import { Role, User } from '@prisma/client';

export interface AuthRequest extends Request {
  user?: User;
}

export interface Tokens {
  access_token: string;
  refresh_token: string;
}

export interface JwtPayload {
  sub: number;
  email: string;
  role: Role;
}

export type JwtPayloadWithRt = JwtPayload & { refreshToken: string };
