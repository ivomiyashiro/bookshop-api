import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ItemsToPayDto } from '../dto';
import { preferences } from '../config';

@Injectable()
export class PaymentService {
  constructor(private config: ConfigService) {} // Injecting dependecies

  async createPayment(dto: ItemsToPayDto) {
    try {
      const response = await fetch(
        `${this.config.get('MERCADOPAGO_CHECKOUT_URL')}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.config.get(
              'MERCADOPAGO_ACCESS_TOKEN',
            )}`,
          },
          body: JSON.stringify({
            ...dto,
            ...preferences,
          }),
        },
      );

      const { init_point } = await response.json();

      return init_point;
    } catch (error) {
      throw new InternalServerErrorException('Internal Server Error');
    }
  }
}
