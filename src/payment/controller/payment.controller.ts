import { Controller, Post, Body } from '@nestjs/common';
import { PaymentService } from '../services/payment.service';
import { AuthUserId, Public } from 'src/common/decorators';
import { CreatePaymentDto } from '../dto';
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
  @Public()
  async catchWebHook(@Body(PaymentDataValidationPipe) dto: any) {
    await this.paymentService.catchWebHook(dto.id);

    return { data: { message: 'OK' } };
  }
}
