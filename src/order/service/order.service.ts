import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { OrderStatus, User } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class OrderService {
  constructor(private prismaService: PrismaService) {}

  async getMyOrders(params: any, user: Omit<User, 'password'>) {
    const { limit, offset, orderBy, sortBy, where } = params;

    try {
      const ordersQuery = this.prismaService.order.findMany({
        skip: offset,
        take: limit,
        where: {
          ...where,
          customerId: user.id,
        },
        orderBy: { [orderBy]: sortBy },
        include: {
          orderItems: true,
          customer: {
            select: {
              email: true,
              name: true,
            },
          },
        },
      });

      const totalCountQuery = this.prismaService.order.count({
        where: {
          ...where,
          customerId: user.id,
        },
      });

      const [orders, totalCount] = await this.prismaService.$transaction([
        ordersQuery,
        totalCountQuery,
      ]);

      return { orders, count: orders.length, totalCount };
    } catch (error) {
      throw new InternalServerErrorException('Internal server error.');
    }
  }

  async getMyOrder(id: number, uid: number) {
    try {
      const order = await this.prismaService.order.findUnique({
        where: {
          id,
          customerId: uid,
        },
        include: {
          orderItems: {
            where: {
              orderId: id,
            },
            include: {
              book: true,
            },
          },
        },
      });

      return order;
    } catch (error) {
      throw new InternalServerErrorException('Internal server error.');
    }
  }

  async getOrders(params: any) {
    const { limit, offset, orderBy, sortBy, where } = params;

    try {
      const ordersQuery = this.prismaService.order.findMany({
        skip: offset,
        take: limit,
        where,
        orderBy: { [orderBy]: sortBy },
        include: {
          orderItems: true,
          customer: {
            select: {
              email: true,
              name: true,
            },
          },
        },
      });

      const totalCountQuery = this.prismaService.order.count({
        where,
      });

      const [orders, totalCount] = await this.prismaService.$transaction([
        ordersQuery,
        totalCountQuery,
      ]);

      return { orders, count: orders.length, totalCount };
    } catch (error) {
      throw new InternalServerErrorException('Internal server error.');
    }
  }

  async updateOrder(id: number, status: OrderStatus) {
    try {
      const order = await this.prismaService.order.update({
        where: { id },
        data: { status },
      });

      return order;
    } catch (error) {
      throw new InternalServerErrorException('Internal server error.');
    }
  }
}
