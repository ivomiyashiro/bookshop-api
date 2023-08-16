import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class OrderService {
  constructor(private prismaService: PrismaService) {}

  async getMyOrders(params: any, uid) {
    const { page, limit, offset, orderBy, sortBy, where } = params;

    try {
      const ordersQuery = this.prismaService.order.findMany({
        skip: offset,
        take: limit,
        where: {
          ...where,
          customerId: uid,
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
          customerId: uid,
        },
      });

      const [orders, totalCount] = await this.prismaService.$transaction([
        ordersQuery,
        totalCountQuery,
      ]);

      return {
        orders,
        page,
        totalPages: Math.ceil(totalCount / limit),
        count: orders.length,
        totalCount,
      };
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
              book: {
                include: {
                  authors: true,
                },
              },
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
    const { page = 1, limit, offset, orderBy, sortBy, where } = params;

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

      return {
        orders,
        page,
        totalPages: Math.ceil(totalCount / limit),
        count: orders.length,
        totalCount,
      };
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
