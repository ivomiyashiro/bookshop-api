/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';

@Injectable()
export class UserFilterPipe implements PipeTransform {
  transform(value: any, _metadata: ArgumentMetadata) {
    const { search, role, limit = 12, offset = 0, orderBy, sortBy } = value;

    const VALID_SORTBY = ['desc', 'asc', undefined];
    const VALID_ORDERBY = ['name', 'email', 'createdAt', undefined];

    const filters: any = {};

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

    if (search) {
      filters.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) filters.role = role;

    return {
      limit: Number(limit),
      offset: Number(offset),
      orderBy,
      sortBy,
      filters,
    };
  }
}
