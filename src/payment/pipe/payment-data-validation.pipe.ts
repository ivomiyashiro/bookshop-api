/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';

@Injectable()
export class PaymentDataValidationPipe implements PipeTransform {
  async transform(value: any, _metadata: ArgumentMetadata) {
    const { action, data } = value;

    if (action !== 'payment.created' && action !== 'test.created') {
      throw new BadRequestException(['Action requested is not valid.']);
    }

    return { id: parseInt(data.id) };
  }
}
