import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './service/auth.service';
import { AtStrategy, RtStrategy, GoogleStrategy } from './strategy';
import { AuthController } from './controller/auth.controller';

@Module({
  imports: [JwtModule.register({ global: true }), PassportModule.register({})],
  controllers: [AuthController],
  providers: [AuthService, GoogleStrategy, AtStrategy, RtStrategy],
})
export class AuthModule {}
