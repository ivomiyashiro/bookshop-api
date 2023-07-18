import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Role, User } from '@prisma/client';
import { OrderService } from '../service/order.service';
import { OrderQueryValidation } from '../pipe';
import { Roles } from 'src/user/decorator';
import { RolesGuard } from 'src/user/guard';
import { UpdateOrderDto } from '../dto';
import { AuthUser } from 'src/common/decorators';

@Controller('api')
export class OrderController {
  constructor(private orderService: OrderService) {}

  @Get('/storefront/orders')
  async getMyOrders(
    @Query(OrderQueryValidation) params: any,
    @AuthUser() me: Omit<User, 'password'>,
  ) {
    const { orders, count, totalCount } = await this.orderService.getMyOrders(
      params,
      me,
    );

    return { data: { orders, count, totalCount } };
  }

  @Get('/storefront/orders/:id')
  async getMyOrder(
    @Param('id', new ParseIntPipe()) id: number,
    @AuthUser() me: Omit<User, 'password'>,
  ) {
    const order = await this.orderService.getMyOrder(id, me.id);

    return { data: { order } };
  }

  @Get('/admin/orders')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async getOrders(@Query(OrderQueryValidation) params: any) {
    const { orders, count, totalCount } = await this.orderService.getOrders(
      params,
    );

    return { data: { orders, count, totalCount } };
  }

  @Put('/admin/orders/:id')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async updateOrder(
    @Param('id', new ParseIntPipe()) id: number,
    @Body() dto: UpdateOrderDto,
  ) {
    const order = await this.orderService.updateOrder(id, dto.status);

    return { data: { order } };
  }
}
