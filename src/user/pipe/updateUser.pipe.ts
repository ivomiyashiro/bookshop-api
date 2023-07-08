/* eslint-disable @typescript-eslint/no-unused-vars */
import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { User } from '@prisma/client';
import { hash } from 'argon2';

@Injectable()
export class UpdateUserPipe implements PipeTransform {
  async transform(value: Partial<User>, _metadata: ArgumentMetadata) {
    const { email, password, name, role } = value;
    const updatedData: Partial<User> = {};

    if (email) updatedData.email = email;

    if (password) updatedData.password = await hash(password);

    if (name) updatedData.name = name;

    if (role) updatedData.role = role;

    return { ...updatedData };
  }
}
