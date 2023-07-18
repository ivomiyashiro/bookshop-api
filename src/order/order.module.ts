import { Module } from '@nestjs/common';
import { OrderController } from './controller/order.controller';
import { OrderService } from './service/order.service';

@Module({
  providers: [OrderService],
  controllers: [OrderController],
})
export class OrdersModule {}
