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
import { AuthService, AuthRequest, SignupDto, LoginDto } from '../';

// Controller handles api routes
@Controller('api/auth')
export class AuthController {
  constructor(private auth: AuthService) {} // Injecting AuthService

  @Post('signup') // dto is Data Transfer Object
  async signup(@Body() dto: SignupDto) {
    const user = await this.auth.signup(dto);

    return {
      data: {
        user,
      },
    };
  }

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.auth.login(dto, res);

    return {
      data: {
        user,
      },
    };
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
