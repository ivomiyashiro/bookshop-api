import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreatePaymentDto } from '../dto';
import { preferences } from '../preferences';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PaymentService {
  constructor(
    private configService: ConfigService,
    private prismaService: PrismaService,
  ) {} // Injecting dependecies

  async createPayment(dto: CreatePaymentDto, uid: number) {
    try {
      const response = await fetch(
        `${this.configService.get(
          'MERCADOPAGO_API_BASE_URL',
        )}/checkout/preferences`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.configService.get(
              'MERCADOPAGO_ACCESS_TOKEN',
            )}`,
          },
          body: JSON.stringify({
            ...dto,
            ...preferences,
            metadata: {
              uid,
              shippingAddress: {
                ...dto.shippingAddress,
              },
            },
          }),
        },
      );

      const { init_point } = await response.json();

      return init_point;
    } catch (error) {
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  async createOrderAfterPayment(paymentId: number) {
    try {
      const response = await fetch(
        `${this.configService.get(
          'MERCADOPAGO_API_BASE_URL',
        )}/v1/payments/${paymentId}`,
        {
          headers: {
            Authorization: `Bearer ${this.configService.get(
              'MERCADOPAGO_ACCESS_TOKEN',
            )}`,
          },
        },
      );

      const { items, transaction_amount, metadata } = await response.json();
      const { uid, shipping_address } = metadata;

      const itemsPayed = items.map(({ id, unit_price, quantity }) => ({
        bookId: id,
        price: parseInt(unit_price),
        quantity: quantity,
      }));

      const updateStock = items.map(({ id, quantity }) => {
        return this.prismaService.book.update({
          where: { id },
          data: { stock: { decrement: quantity } },
        });
      });

      const createOrder = this.prismaService.order.create({
        data: {
          totalPrice: transaction_amount,
          customerId: uid,
          orderItems: {
            createMany: { data: itemsPayed },
          },
          address: shipping_address.address,
          province: shipping_address.province,
          locality: shipping_address.locality,
          zip: shipping_address.zip,
        } as any,
      });

      const [updatedStock, order] = await this.prismaService.$transaction([
        ...updateStock,
        createOrder,
      ]);

      console.log(updatedStock, order);
    } catch (error) {
      throw new InternalServerErrorException('Internal Server Error');
    }
  }
}
