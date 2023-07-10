import { Module } from '@nestjs/common';
import { BookController } from './controller/book.controller';
import { BookService } from './service/book.service';

@Module({
  controllers: [BookController],
  providers: [BookService],
})
export class BookModule {}
