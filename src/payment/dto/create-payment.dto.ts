import {
  IsString,
  IsNumber,
  IsUrl,
  ValidateNested,
  ArrayNotEmpty,
  IsNotEmpty,
  IsEnum,
} from 'class-validator';

enum Currency {
  ARS = 'ARS',
}

class ItemDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  @IsEnum(Currency)
  currency_id: string;

  @IsNotEmpty()
  @IsUrl()
  picture_url: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @IsNotEmpty()
  @IsNumber()
  unit_price: number;
}

export class CreatePaymentDto {
  @ValidateNested({ each: true })
  @ArrayNotEmpty()
  items: ItemDto[];
}
