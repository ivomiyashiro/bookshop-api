import { Body, Controller, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto, LoginDto } from './dto';
import { Response } from 'express';

// Controller handles api routes
@Controller('api/auth')
export class AuthController {
  constructor(private auth: AuthService) {} // Injecting AuthService

  @Post('signup') // dto is Data Transfer Object
  signup(@Body() dto: SignupDto) {
    return this.auth.signup(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto, @Res({ passthrough: true }) response: Response) {
    return this.auth.login(dto, response);
  }
}
