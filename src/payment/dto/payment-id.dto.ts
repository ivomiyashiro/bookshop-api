import { IsNumber, IsNotEmpty } from 'class-validator';

export class PaymentIdDto {
  @IsNumber()
  @IsNotEmpty()
  id: number;
}
