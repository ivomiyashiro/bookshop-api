/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';

@Injectable()
export class ClientQueryParamsPipe implements PipeTransform {
  transform(value: any, _metadata: ArgumentMetadata) {
    const {
      limit = 10,
      offset = 0,
      orderBy = 'title',
      sortBy = 'asc',
      filters,
    } = value;

    const VALID_SORTBY = ['desc', 'asc', undefined];
    const VALID_ORDERBY = ['title', 'price', 'createdAt', undefined];

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
    where.status = 'VISIBLE';

    if (filters) {
      const filtersObj = JSON.parse(filters);

      if (filtersObj.searchText) {
        where.OR = [
          { title: { contains: filtersObj.searchText, mode: 'insensitive' } },
          {
            authors: {
              every: {
                name: { contains: filtersObj.searchText, mode: 'insensitive' },
              },
            },
          },
        ];
      }

      if (filtersObj.languages) {
        where.languages = {
          some: {
            id: { in: filtersObj.languages },
          },
        };
      }

      if (filtersObj.authors) {
        where.authors = {
          some: {
            id: { in: filtersObj.authors },
          },
        };
      }

      if (filtersObj.price) {
        if (filtersObj.price.max && filtersObj.price.min) {
          where.price = {
            gte: filtersObj.price.min,
            lte: filtersObj.price.max,
          };
        } else if (filtersObj.price.min) {
          where.price = {
            gte: filtersObj.price.min,
          };
        } else if (filtersObj.price.max) {
          where.price = {
            lte: filtersObj.price.max,
          };
        }
      }
    }

    return {
      limit: Number(limit),
      offset: Number(offset),
      orderBy,
      sortBy,
      where,
    };
  }
}
