import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthRequest, SignupDto, LoginDto } from '../';
import { AuthService } from '../service/auth.service';
import { AuthUserId } from '../../common/decorators/get-user-id.decorator';
import { AuthUser, Public } from 'src/common/decorators';
import { RtGuard } from 'src/common/guard';

// Controller handles api routes
@Controller('api/auth')
export class AuthController {
  constructor(private auth: AuthService) {} // Injecting AuthService

  @Post('local/signup') // dto is Data Transfer Object
  @Public()
  @HttpCode(HttpStatus.CREATED)
  async signup(@Body() dto: SignupDto) {
    const user = await this.auth.signup(dto);

    return { data: { user } };
  }

  @Post('local/login')
  @Public()
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.auth.login(dto, res);

    return { data: { user } };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@AuthUserId() id: number) {
    await this.auth.logout(id);

    return { data: { message: 'Successfully logout.' } };
  }

  @Post('refresh')
  @Public()
  @UseGuards(RtGuard)
  @HttpCode(HttpStatus.OK)
  async refreshTokens(
    @AuthUser('refreshToken') refreshToken: string,
    @AuthUserId() uid: number,
    @Res() res: Response,
  ) {
    const tokens = await this.auth.refreshTokens(res, uid, refreshToken);

    return { data: { tokens } };
  }

  @Get('provider/google')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // This route will initiate the Google authentication flow.
  }

  @Get('provider/google/callback')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req: AuthRequest, @Res() res: Response) {
    return this.auth.googleAuth(req, res);
  }
}
