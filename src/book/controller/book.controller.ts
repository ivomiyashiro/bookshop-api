import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  AdminQueryParamsPipe,
  ClientQueryParamsPipe,
  UpdateBookPipe,
  AdaptQueryFieldsPipe,
} from '../pipe';
import { CreateBookDto, UpdateBookDto } from '../dto';
import { BookService } from '../service/book.service';
import { Roles } from 'src/user/decorator';
import { Role } from '@prisma/client';
import { RolesGuard } from 'src/user/guard';
import { Public } from 'src/common/decorators';

@Controller('api/')
export class BookController {
  constructor(private bookService: BookService) {}
  // Client routers --->
  @Public()
  @Get('storefront/books')
  async getBooks(@Query(ClientQueryParamsPipe) query: any) {
    const { books, page, totalPages, count, totalCount } =
      await this.bookService.getBooks(query);

    return {
      data: {
        books,
        pagination: {
          page,
          totalPages,
          count,
          totalCount,
        },
      },
    };
  }

  @Public()
  @Get('storefront/books/authors')
  async getBooksAuthors() {
    const { authors, count, totalCount } =
      await this.bookService.getBooksAuthors();

    return { data: { authors, count, totalCount } };
  }

  @Public()
  @Get('storefront/books/languages')
  async getBooksLanguages() {
    const { languages, count, totalCount } =
      await this.bookService.getBooksLanguages();

    return { data: { languages, count, totalCount } };
  }

  @Public()
  @Get('storefront/books/price')
  async getBooksMinMaxPrice() {
    const { min, max } = await this.bookService.getBooksMinMaxPrice();
    return { data: { price: { min, max } } };
  }

  @Public()
  @Get('storefront/books/:id')
  async getBookById(
    @Param('id', new ParseIntPipe()) id: number,
    @Query(AdaptQueryFieldsPipe) fields?: string[],
  ) {
    const book = await this.bookService.getBookById(id, fields);

    return { data: { book } };
  }

  @Public()
  @Get('storefront/books/slug/:slug')
  async getBookByHandle(@Param() params: { slug: string }) {
    const book = await this.bookService.getBookByHandle(params.slug);

    return { data: { book } };
  }

  // Admin routes --->
  @Get('admin/books')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async getAdminBooks(@Query(AdminQueryParamsPipe) query: any) {
    const { books, page, totalPages, count, totalCount } =
      await this.bookService.getAdminBooks(query);

    return {
      data: {
        books,
        pagination: {
          page,
          totalPages,
          count,
          totalCount,
        },
      },
    };
  }

  @Post('admin/books')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async createBook(@Body() dto: CreateBookDto) {
    const book = await this.bookService.createBook(dto);

    return { data: { book } };
  }

  @Get('admin/books/:id')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async getAdminBook(@Param('id', new ParseIntPipe()) id: number) {
    const book = await this.bookService.getAdminBook(id);

    return { data: { book } };
  }

  @Put('admin/books/:id')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async updateBook(
    @Param('id', new ParseIntPipe()) id: number,
    @Body(UpdateBookPipe) dto: UpdateBookDto,
  ) {
    const book = await this.bookService.updateBook(id, dto);

    return { data: { book } };
  }

  @Delete('admin/books/:id')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async deleteBook(@Param('id', new ParseIntPipe()) id: number) {
    await this.bookService.deleteBook(id);

    return {
      data: { message: [`Book ${id} has been deleted`] },
    };
  }
}
