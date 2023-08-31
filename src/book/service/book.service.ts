import {
  BadGatewayException,
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Book, Prisma } from '@prisma/client';
import { BookDto, CreateBookDto, UpdateBookDto } from '../dto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class BookService {
  constructor(private prismaService: PrismaService) {}

  async getBooks(query: any) {
    const { page, limit, offset, orderBy, sortBy, where } = query;

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
        this.prismaService.book.count({ where }),
      ]);

      return {
        books,
        page,
        totalPages: Math.ceil(totalCount / limit),
        count: books.length,
        totalCount,
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new BadRequestException([`Validation error`]);
      }

      if (error instanceof Prisma.PrismaClientInitializationError) {
        throw new BadGatewayException([`Database connection error`]);
      }

      throw new InternalServerErrorException('Internal server error.');
    }
  }

  async getBookById(id: number, fields?: string[]) {
    try {
      const book = await this.prismaService.book.findUniqueOrThrow({
        where: { id },
        select: this.selectBookFields(fields),
      });

      return book;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException([`Book with id ${id} not found.`]);
        }
      }

      if (error instanceof Prisma.PrismaClientInitializationError) {
        throw new BadGatewayException([`Database connection error`]);
      }

      throw error;
    }
  }

  async getBookByHandle(slug: string) {
    try {
      const book = await this.prismaService.book.findUniqueOrThrow({
        where: { slug },
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
          throw new NotFoundException([`Book with slug ${slug} not found.`]);
        }
      }

      if (error instanceof Prisma.PrismaClientInitializationError) {
        throw new BadGatewayException([`Database connection error`]);
      }

      throw error;
    }
  }

  async createBook(dto: CreateBookDto) {
    let books: Book[];

    try {
      books = await Promise.all(
        dto.books.map(async (dto: BookDto) => {
          return await this.prismaService.book.create({
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
        }),
      );

      return books;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException([`Duplicate book title.`]);
        }
      }

      if (error instanceof Prisma.PrismaClientInitializationError) {
        throw new BadGatewayException([`Database connection error`]);
      }

      throw error;
    }
  }

  async getAdminBooks(query: any) {
    const { page, limit, offset, orderBy, sortBy, where } = query;

    try {
      const [books, totalCount] = await this.prismaService.$transaction([
        this.prismaService.book.findMany({
          skip: offset,
          take: limit,
          where,
          orderBy: { [orderBy]: sortBy },
        }),
        this.prismaService.book.count({ where }),
      ]);

      return {
        books,
        page,
        totalPages: Math.ceil(totalCount / limit),
        count: books.length,
        totalCount,
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new BadRequestException([`Validation error`]);
      }

      if (error instanceof Prisma.PrismaClientInitializationError) {
        throw new BadGatewayException([`Database connection error`]);
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

      if (error instanceof Prisma.PrismaClientInitializationError) {
        throw new BadGatewayException([`Database connection error`]);
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

      if (error instanceof Prisma.PrismaClientInitializationError) {
        throw new BadGatewayException([`Database connection error`]);
      }

      throw error;
    }
  }

  async getBooksAuthors() {
    try {
      const [authors, totalCount] = await this.prismaService.$transaction([
        this.prismaService.author.findMany(),
        this.prismaService.author.count(),
      ]);

      return { authors, count: authors.length, totalCount };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientInitializationError) {
        throw new BadGatewayException([`Database connection error`]);
      }

      throw error;
    }
  }

  async getBooksLanguages() {
    try {
      const [languages, totalCount] = await this.prismaService.$transaction([
        this.prismaService.language.findMany(),
        this.prismaService.language.count(),
      ]);

      return { languages, count: languages.length, totalCount };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientInitializationError) {
        throw new BadGatewayException([`Database connection error`]);
      }

      throw error;
    }
  }

  async getBooksMinMaxPrice() {
    const select = { price: true };
    try {
      const [min, max] = await this.prismaService.$transaction([
        this.prismaService.book.findFirst({
          orderBy: {
            price: 'asc',
          },
          select,
        }),
        this.prismaService.book.findFirst({
          orderBy: {
            price: 'desc',
          },
          select,
        }),
      ]);

      return { min: min.price, max: max.price };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientInitializationError) {
        throw new BadGatewayException([`Database connection error`]);
      }

      throw error;
    }
  }

  selectBookFields(fields: string[]) {
    return fields
      ? fields.reduce((acc, field) => ({ ...acc, [field]: true }), {})
      : {
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
        };
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
