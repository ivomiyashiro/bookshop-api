import { Type } from 'class-transformer';
import {
  IsString,
  IsNumber,
  IsUrl,
  ValidateNested,
  ArrayNotEmpty,
  IsNotEmpty,
  IsEnum,
  IsNotEmptyObject,
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

class ShippingAddressDTO {
  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  province: string;

  @IsString()
  @IsNotEmpty()
  locality: string;

  @IsString()
  @IsNotEmpty()
  zip: string;
}

export class CreatePaymentDto {
  @ValidateNested({ each: true })
  @ArrayNotEmpty()
  items: ItemDto[];

  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => ShippingAddressDTO)
  shippingAddress: ShippingAddressDTO;
}
