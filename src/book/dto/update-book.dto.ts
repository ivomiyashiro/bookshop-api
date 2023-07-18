import { IsIn, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { BookStatus } from '@prisma/client';

export class UpdateBookDto {
  @IsOptional()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @IsString()
  image: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  stock: number;

  @IsOptional()
  @IsString()
  @IsIn(['VISIBLE', 'HIDDEN'], { message: 'Invalid book status' })
  status: BookStatus;

  @IsOptional()
  languages: string[];

  @IsOptional()
  authors: string[];
}
