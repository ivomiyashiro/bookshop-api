import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { JwtGuard } from '../../auth/guard';
import { AuthUser } from '../../auth';
import { PaymentService } from '../services/payment.service';
import { CreatePaymentDto, PaymentIdDto } from '../dto';
import {
  CreatePaymentValidationPipe,
  PaymentDataValidationPipe,
} from '../pipe';

@Controller('/api/payments')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Post()
  @UseGuards(JwtGuard)
  async createPayment(
    @Body(CreatePaymentValidationPipe) dto: CreatePaymentDto,
    @AuthUser() user: Omit<User, 'password'>,
  ) {
    const payment_url = await this.paymentService.createPayment(dto, user.id);

    return { data: { payment_url } };
  }

  @Post('/notifications')
  async catchWebHook(@Body(PaymentDataValidationPipe) dto: PaymentIdDto) {
    console.log(dto);
    await this.paymentService.createOrderAfterPayment(dto.id);
    return { data: { msg: 'Ok' } };
  }
}
