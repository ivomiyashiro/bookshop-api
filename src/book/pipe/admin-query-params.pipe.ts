/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';

@Injectable()
export class AdminQueryParamsPipe implements PipeTransform {
  transform(value: any, _metadata: ArgumentMetadata) {
    const {
      page = 1,
      limit = 12,
      orderBy = 'title',
      sortBy = 'asc',
      searchText,
      languages,
      authors,
      price,
    } = value;

    const VALID_SORTBY = ['desc', 'asc', undefined];
    const VALID_ORDERBY = ['title', 'price', 'createdAt', undefined];

    if (isNaN(parseInt(page))) {
      throw new BadRequestException(`Page ${page} is not valid`);
    }

    if (isNaN(parseInt(limit))) {
      throw new BadRequestException(`Limit ${limit} is not valid`);
    }

    if (!VALID_SORTBY.includes(sortBy)) {
      throw new BadRequestException(`SortBy ${sortBy} is not valid`);
    }

    if (!VALID_ORDERBY.includes(orderBy)) {
      throw new BadRequestException(`OrderBy ${orderBy} is not valid`);
    }

    const where: any = {};
    where.status = 'VISIBLE';

    if (searchText) {
      where.OR = [
        { title: { contains: searchText, mode: 'insensitive' } },
        {
          authors: {
            every: {
              name: { contains: searchText, mode: 'insensitive' },
            },
          },
        },
        {
          languages: {
            every: {
              name: { contains: searchText, mode: 'insensitive' },
            },
          },
        },
      ];
    }

    if (languages) {
      where.languages = {
        some: {
          name: { in: languages.split(','), mode: 'insensitive' },
        },
      };
    }

    if (authors) {
      where.authors = {
        some: {
          name: { in: authors.split(','), mode: 'insensitive' },
        },
      };
    }

    if (price) {
      const allNumbers = price.match(/\d+/g).map(Number);
      const prices = Array.from(new Set(allNumbers)) as number[];

      where.price = {
        gte: Math.min(...prices),
        lte: Math.max(...prices),
      };
    }

    return {
      page: parseInt(page),
      limit: parseInt(limit),
      offset: (page - 1) * limit,
      orderBy,
      sortBy,
      where,
    };
  }
}
