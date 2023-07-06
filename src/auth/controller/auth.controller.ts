import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { SignupDto, LoginDto } from '../dto';
import { AuthRequest } from '../interface';

// Controller handles api routes
@Controller('api/auth')
export class AuthController {
  constructor(private auth: AuthService) {} // Injecting AuthService

  @Post('signup') // dto is Data Transfer Object
  signup(@Body() dto: SignupDto) {
    return this.auth.signup(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    return this.auth.login(dto, res);
  }

  @Get('provider/google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // This route will initiate the Google authentication flow.
  }

  @Get('provider/google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req: AuthRequest, @Res() res: Response) {
    return this.auth.googleAuth(req, res);
  }
}
