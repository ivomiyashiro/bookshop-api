import { Module } from '@nestjs/common';
import { OrderController } from './controller/order.controller';

@Module({
  controllers: [OrderController],
})
export class OrdersModule {}
