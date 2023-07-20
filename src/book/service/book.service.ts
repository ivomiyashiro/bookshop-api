import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CreateBookDto, UpdateBookDto } from '../dto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class BookService {
  constructor(private prismaService: PrismaService) {}

  async getBooks(query: any) {
    const { limit, offset, orderBy, sortBy, where } = query;

    try {
      const [books, totalCount] = await this.prismaService.$transaction([
        this.prismaService.book.findMany({
          skip: offset,
          take: limit,
          where,
          orderBy: { [orderBy]: sortBy },
          select: {
            id: true,
            title: true,
            description: true,
            price: true,
            image: true,
            stock: true,
            slug: true,
            createdAt: true,
            updatedAt: true,
            authors: true,
            languages: true,
          },
        }),
        this.prismaService.book.count(),
      ]);

      return { books, count: books.length, totalCount };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new BadRequestException([`Validation error`]);
      }

      throw new InternalServerErrorException('Internal server error.');
    }
  }

  async getBook(id: number) {
    try {
      const book = await this.prismaService.book.findUniqueOrThrow({
        where: { id },
        select: {
          id: true,
          title: true,
          description: true,
          price: true,
          image: true,
          stock: true,
          slug: true,
          createdAt: true,
          updatedAt: true,
          authors: true,
          languages: true,
        },
      });

      return book;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException([`Book with id ${id} not found.`]);
        }
      }

      throw error;
    }
  }

  async createBook(dto: CreateBookDto) {
    try {
      const book = await this.prismaService.book.create({
        data: {
          ...dto,
          slug: this.slugfy(dto.title),
          authors: {
            connectOrCreate: dto.authors.map((author: string) => ({
              where: { name: author },
              create: { name: author },
            })),
          },
          languages: {
            connectOrCreate: dto.languages.map((language) => ({
              where: { name: language },
              create: { name: language },
            })),
          },
        },
        include: {
          authors: true,
          languages: true,
        },
      });

      return book;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException([`Duplicate book title.`]);
        }
      }

      throw error;
    }
  }

  async getAdminBooks(query) {
    const { limit, offset, orderBy, sortBy, where } = query;

    try {
      const [books, totalCount] = await this.prismaService.$transaction([
        this.prismaService.book.findMany({
          skip: offset,
          take: limit,
          where,
          orderBy: { [orderBy]: sortBy },
        }),
        this.prismaService.book.count(),
      ]);

      return { books, count: books.length, totalCount };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new BadRequestException([`Validation error`]);
      }

      throw new InternalServerErrorException('Internal server error.');
    }
  }

  async getAdminBook(id: number) {
    try {
      const book = await this.prismaService.book.findUniqueOrThrow({
        where: { id },
      });

      return book;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException([`Book with id ${id} not found.`]);
        }
      }

      throw error;
    }
  }

  async updateBook(id: number, dto: UpdateBookDto) {
    try {
      const book = await this.prismaService.book.update({
        where: { id },
        data: {
          ...dto,
          authors: {
            connectOrCreate: dto.authors?.map((author: string) => ({
              where: { name: author },
              create: { name: author },
            })),
          },
          languages: {
            connectOrCreate: dto.languages?.map((language) => ({
              where: { name: language },
              create: { name: language },
            })),
          },
        },
        include: {
          authors: true,
          languages: true,
        },
      });

      return book;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException([`Book with id ${id} not found.`]);
        }
      }

      throw error;
    }
  }

  async deleteBook(id: number) {
    try {
      await this.prismaService.book.delete({ where: { id } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException([`Book with id ${id} not found.`]);
        }
      }

      throw error;
    }
  }

  slugfy(title: string) {
    return title
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9 ]/g, '')
      .replace(/\s+/g, '-');
  }
}
