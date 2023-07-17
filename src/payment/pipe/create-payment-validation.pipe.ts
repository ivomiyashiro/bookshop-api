/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CreatePaymentValidationPipe implements PipeTransform {
  constructor(private prismaService: PrismaService) {}
  async transform(value: any, _metadata: ArgumentMetadata) {
    const { items } = value;

    const productsIds = items.map((item) => Number(item.id));

    const dbProducts = await this.prismaService.book.findMany({
      where: { id: { in: productsIds } },
    });

    for (const item of items) {
      const { id, unit_price, quantity } = item;

      const dbItem = dbProducts.find((dbItem) => dbItem.id === Number(id));

      if (!dbItem) {
        throw new BadRequestException([
          `Product with id ${id} does not exists`,
        ]);
      }

      if (dbItem.price !== unit_price) {
        throw new BadRequestException(
          `The price given does not match with database`,
        );
      }

      if (dbItem.stock < quantity) {
        throw new BadRequestException(`Quantity requested is not available.`);
      }
    }

    return value;
  }
}
