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
} from '@nestjs/common';
import {
  AdminQueryParamsPipe,
  ClientQueryParamsPipe,
  UpdateBookPipe,
} from '../pipe';
import { CreateBookDto, UpdateBookDto } from '../dto';
import { BookService } from '../service/book.service';

@Controller('api/')
export class BookController {
  constructor(private bookService: BookService) {}
  // Client routers --->
  @Get('storefront/books')
  async getBooks(@Query(ClientQueryParamsPipe) query: any) {
    const { books, count, totalCount } = await this.bookService.getBooks(query);

    return { data: { books, count, totalCount } };
  }

  @Get('storefront/books/:id')
  async getBook(@Param('id', new ParseIntPipe()) id: number) {
    const book = await this.bookService.getBook(id);

    return { data: { book } };
  }

  // Admin routes --->
  @Get('admin/books')
  async getAdminBooks(@Query(AdminQueryParamsPipe) query: any) {
    const { books, count, totalCount } = await this.bookService.getAdminBooks(
      query,
    );

    return { data: { books, count, totalCount } };
  }

  @Post('admin/books')
  async createBook(@Body() dto: CreateBookDto) {
    const book = await this.bookService.createBook(dto);

    return { data: { book } };
  }

  @Get('admin/books/:id')
  async getAdminBook(@Param('id', new ParseIntPipe()) id: number) {
    const book = await this.bookService.getAdminBook(id);

    return { data: { book } };
  }

  @Put('admin/books/:id')
  async updateBook(
    @Param('id', new ParseIntPipe()) id: number,
    @Body(UpdateBookPipe) dto: UpdateBookDto,
  ) {
    const book = await this.bookService.updateBook(id, dto);

    return { data: { book } };
  }

  @Delete('admin/books/:id')
  async deleteBook(@Param('id', new ParseIntPipe()) id: number) {
    await this.bookService.deleteBook(id);

    return {
      data: { message: [`Book ${id} has been deleted`] },
    };
  }
}
