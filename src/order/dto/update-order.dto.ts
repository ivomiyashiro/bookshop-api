import { IsIn, IsNotEmpty, IsString } from 'class-validator';
import { OrderStatus } from '@prisma/client';

export class UpdateOrderDto {
  @IsNotEmpty()
  @IsString()
  @IsIn(['CANCELLED', 'PAID', 'PENDING'])
  status: OrderStatus;
}
