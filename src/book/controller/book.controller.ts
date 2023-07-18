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
    const { books, count, totalCount } = await this.bookService.getBooks(query);

    return { data: { books, count, totalCount } };
  }

  @Public()
  @Get('storefront/books/:id')
  async getBook(@Param('id', new ParseIntPipe()) id: number) {
    const book = await this.bookService.getBook(id);

    return { data: { book } };
  }

  // Admin routes --->
  @Get('admin/books')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async getAdminBooks(@Query(AdminQueryParamsPipe) query: any) {
    const { books, count, totalCount } = await this.bookService.getAdminBooks(
      query,
    );

    return { data: { books, count, totalCount } };
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
