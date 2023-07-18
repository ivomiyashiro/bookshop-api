import { Controller, Post, Body } from '@nestjs/common';
import { PaymentService } from '../services/payment.service';
import { AuthUserId } from 'src/common/decorators';
import { CreatePaymentDto, PaymentIdDto } from '../dto';
import {
  CreatePaymentValidationPipe,
  PaymentDataValidationPipe,
} from '../pipe';

@Controller('/api/payments')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Post()
  async createPayment(
    @Body(CreatePaymentValidationPipe) dto: CreatePaymentDto,
    @AuthUserId() uid: number,
  ) {
    const payment_url = await this.paymentService.createPayment(dto, uid);

    return { data: { payment_url } };
  }

  @Post('/notifications')
  async catchWebHook(@Body(PaymentDataValidationPipe) dto: PaymentIdDto) {
    await this.paymentService.createOrderAfterPayment(dto.id);
    return { data: { message: 'OK' } };
  }
}
