import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { BookStatus } from '@prisma/client';

export class BookDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @IsString()
  image: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  stock: number;

  @IsNotEmpty()
  @IsString()
  status: BookStatus;

  @IsNotEmpty()
  @IsArray()
  languages: string[];

  @IsNotEmpty()
  @IsArray()
  authors: string[];
}

export class CreateBookDto {
  @ValidateNested({ each: true })
  @ArrayNotEmpty()
  books: BookDto[];
}
