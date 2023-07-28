/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';

@Injectable()
export class OrderQueryValidation implements PipeTransform {
  transform(value: any, _metadata: ArgumentMetadata) {
    const {
      limit = 12,
      offset = 0,
      orderBy = 'createdAt',
      sortBy = 'asc',
      filters,
    } = value;

    const VALID_SORTBY = ['desc', 'asc', undefined];
    const VALID_ORDERBY = ['totalPrice', 'createdAt', undefined];

    if (isNaN(Number(limit))) {
      throw new BadRequestException(`Limit ${limit} is not valid`);
    }

    if (isNaN(Number(offset))) {
      throw new BadRequestException(`Offset ${offset} is not valid`);
    }

    if (!VALID_SORTBY.includes(sortBy)) {
      throw new BadRequestException(`SortBy ${sortBy} is not valid`);
    }

    if (!VALID_ORDERBY.includes(orderBy)) {
      throw new BadRequestException(`OrderBy ${orderBy} is not valid`);
    }

    const where: any = {};

    if (filters) {
      const filtersObj = JSON.parse(filters);

      if (filtersObj.searchText) {
        where.id = parseInt(filtersObj.searchText);
      }

      if (filtersObj.totalPrice) {
        if (filtersObj.totalPrice.max && filtersObj.totalPrice.min) {
          where.totalPrice = {
            gte: filtersObj.totalPrice.min,
            lte: filtersObj.totalPrice.max,
          };
        } else if (filtersObj.totalPrice.min) {
          where.totalPrice = {
            gte: filtersObj.totalPrice.min,
          };
        } else if (filtersObj.totalPrice.max) {
          where.totalPrice = {
            lte: filtersObj.totalPrice.max,
          };
        }
      }

      if (filtersObj.status) {
        where.paymentStatus = filtersObj.status;
      }
    }

    return {
      limit: parseInt(limit),
      offset: parseInt(offset),
      orderBy,
      sortBy,
      where,
    };
  }
}
