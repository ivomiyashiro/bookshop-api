/* eslint-disable @typescript-eslint/no-unused-vars */
import { Response } from 'express';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { IQuery } from '../interface';
import { UpdateMeDto, UpdateUserDto } from '../dto';
import { AuthService } from '../../auth';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(
    private prismaService: PrismaService,
    private authService: AuthService,
  ) {}

  async updateMe(dto: UpdateMeDto, me: Omit<User, 'password'>, res: Response) {
    try {
      const user = await this.prismaService.user.update({
        where: { id: me.id },
        data: { ...dto },
      });

      const token = await this.authService.getTokens(
        user.id,
        user.email,
        user.role,
      );

      res.cookie('ACCESS_TOKEN', token, {
        maxAge: 12 * 60 * 60 * 1000, // 12h
      });

      const { password, ...restOfUser } = user;

      return { ...restOfUser };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(['Email is already in use']);
        }
      }

      throw new InternalServerErrorException('Internal server error.');
    }
  }

  async getUser(id: number) {
    try {
      const user = await this.prismaService.user.findFirstOrThrow({
        where: { id },
      });

      const { password, ...restOfUser } = user;

      return { ...restOfUser };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException([`User with id ${id} not found`]);
        }
      }

      throw new InternalServerErrorException('Internal server error.');
    }
  }

  async getUsers(query: IQuery) {
    const { limit, offset, orderBy, sortBy, filters } = query;

    try {
      const users = await this.prismaService.user.findMany({
        skip: offset,
        take: limit,
        where: filters,
        orderBy: { [orderBy]: sortBy },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      const totalCount = await this.prismaService.user.count();

      return { users, count: users.length, totalCount };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new BadRequestException([`Validation error`]);
      }

      throw new InternalServerErrorException('Internal server error.');
    }
  }

  async updateUser(id: number, dto: UpdateUserDto) {
    try {
      const user = await this.prismaService.user.update({
        where: { id },
        data: { ...dto },
      });

      const { password, ...restOfUser } = user;

      return { ...restOfUser };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(['Email is already in use']);
        }
      }

      throw new InternalServerErrorException('Internal server error.');
    }
  }

  async deleteUser(id: number) {
    try {
      await this.prismaService.user.delete({ where: { id } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new ConflictException([`User with id ${id} does not exist.`]);
        }
      }

      throw new InternalServerErrorException('Internal server error.');
    }
  }
}
