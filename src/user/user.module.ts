import { Module } from '@nestjs/common';
import { UserService } from './service/user.service';
import { UserController } from './controller/user.controller';
import { AuthService } from '../auth';

@Module({
  providers: [UserService, AuthService],
  controllers: [UserController],
})
export class UserModule {}
