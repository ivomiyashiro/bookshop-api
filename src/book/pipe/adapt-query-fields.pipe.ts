/* eslint-disable @typescript-eslint/no-unused-vars */
import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class AdaptQueryFieldsPipe implements PipeTransform {
  transform(value: any, _metadata: ArgumentMetadata) {
    const { fields } = value;

    if (fields) {
      return fields.split(',');
    }
  }
}
