import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService, GoogleStrategy, JwtStrategy } from './';
import { AuthController } from './controller/auth.controller';

@Module({
  imports: [JwtModule.register({ global: true }), PassportModule.register({})],
  providers: [AuthService, GoogleStrategy, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
