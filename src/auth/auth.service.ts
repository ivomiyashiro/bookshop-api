/* eslint-disable @typescript-eslint/no-unused-vars */
import { Response } from 'express';
import {
  ConflictException,
  Injectable,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { hash, verify } from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, SignupDto } from './dto';
import { AuthRequest } from './interface';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private jwt: JwtService,
  ) {} // Injecting dependecies

  async signup(dto: SignupDto) {
    const hashedPassword = await hash(dto.password);

    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          password: hashedPassword,
          name: dto.name,
        },
      });

      const { password, ...restOfUser } = user;

      return {
        data: {
          user: restOfUser,
        },
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(['Email is already in use']);
        }
      }

      throw error;
    }
  }

  async login(dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const ERROR = 'Email or password incorrect.';

    try {
      const user = await this.prisma.user.findFirstOrThrow({
        where: { email: dto.email },
      });

      const passwordMatch = await verify(user.password, dto.password);

      if (!passwordMatch) {
        throw new UnauthorizedException(ERROR);
      }

      const token = await this.signToken(user.id, user.email, user.role);

      res.cookie('ACCESS_TOKEN', token, {
        maxAge: 12 * 60 * 60 * 1000, // 12h
      });

      const { password, ...restOfUser } = user;

      return {
        data: {
          user: restOfUser,
        },
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new UnauthorizedException(ERROR);
        }
      }

      throw error;
    }
  }

  async googleAuth(@Req() req: AuthRequest, @Res() res: Response) {
    const { id, email, role } = req.user;

    const token = await this.signToken(id, email, role);

    if (!token) {
      return res.redirect(this.config.get('CLIENT_ORIGIN'));
    }

    res.cookie('ACCESS_TOKEN', token, {
      maxAge: 12 * 60 * 60 * 1000, // 12h
    });

    return res.redirect(this.config.get('CLIENT_ORIGIN'));
  }

  async signToken(userId: number, email: string, role: Role): Promise<string> {
    const payload = {
      sub: userId,
      email,
      role,
    };

    try {
      const token = await this.jwt.signAsync(payload, {
        expiresIn: '12h',
        secret: this.config.get('JWT_SECRET'),
      });

      return token;
    } catch (error) {
      console.log(error);

      return null;
    }
  }
}
