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
import { ConfigService } from '@nestjs/config';
import { AuthRequest, SignupDto, LoginDto } from '../';
import { AuthService } from '../service/auth.service';
import { AuthUserId } from '../../common/decorators/get-user-id.decorator';
import { AuthUser, Public } from 'src/common/decorators';
import { RtGuard } from 'src/common/guard';

// Controller handles api routes
@Controller('api/auth')
export class AuthController {
  constructor(private auth: AuthService, private config: ConfigService) {} // Injecting AuthService

  @Post('local/signup') // dto is Data Transfer Object
  @Public()
  @HttpCode(HttpStatus.CREATED)
  async signup(@Body() dto: SignupDto) {
    const { user } = await this.auth.signup(dto);

    return { data: { user } };
  }

  @Post('local/login')
  @Public()
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, tokens } = await this.auth.login(dto, res);

    return { data: { user, tokens } };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @AuthUserId() id: number,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.auth.logout(id, res);

    return { data: { message: 'Successfully logout.' } };
  }

  @Post('refresh')
  @Public()
  @UseGuards(RtGuard)
  @HttpCode(HttpStatus.OK)
  async refreshTokens(
    @AuthUser('refreshToken') refreshToken: string,
    @AuthUserId() uid: number,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, tokens } = await this.auth.refreshTokens(
      res,
      uid,
      refreshToken,
    );

    return { data: { user, tokens } };
  }

  @Get('provider/google')
  @Public()
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // This route will initiate the Google authentication flow.
  }

  @Get('provider/google/callback')
  @Public()
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req: AuthRequest, @Res() res: Response) {
    await this.auth.googleAuth(req, res);

    return res.redirect(this.config.get('CLIENT_ORIGIN'));
  }
}
