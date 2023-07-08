import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateMeDto {
  @IsEmail({}, { message: 'Email is not valid' })
  @IsOptional()
  email: string;

  @IsString()
  @IsOptional()
  password: string;

  @IsString()
  @IsOptional()
  name: string;
}
