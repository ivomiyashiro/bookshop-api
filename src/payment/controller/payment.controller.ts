import { Controller, Post, Body } from '@nestjs/common';
import { PaymentService } from '../services/payment.service';
import { ItemsToPayDto } from '../dto';
import { ItemsDataValidationPipe } from '../pipe';

@Controller('/api/payment')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Post()
  async createPayment(@Body(ItemsDataValidationPipe) dto: ItemsToPayDto) {
    const payment_url = await this.paymentService.createPayment(dto);

    return {
      data: { payment_url },
    };
  }

  @Post('/notifications')
  async catchWebHook(@Body() dto: any) {
    console.log(dto);
    return { data: { msg: 'Recibido' } };
  }
}
