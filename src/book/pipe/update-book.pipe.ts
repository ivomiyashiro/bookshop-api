/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';

@Injectable()
export class UpdateBookPipe implements PipeTransform {
  transform(value: any, _metadata: ArgumentMetadata) {
    const {
      id,
      title,
      description,
      price,
      image,
      stock,
      status,
      languages,
      authors,
    } = value;

    if (id) {
      throw new BadRequestException(['Can not change book id']);
    }

    return {
      title,
      description,
      price,
      image,
      stock,
      status,
      languages,
      authors,
    };
  }
}
