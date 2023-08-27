import { PassportStrategy } from '@nestjs/passport';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { PrismaService } from '../../prisma/prisma.service';
import { hash } from 'argon2';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(config: ConfigService, private prisma: PrismaService) {
    super({
      clientID: config.get('GOOGLE_CLIENT_ID'),
      clientSecret: config.get('GOOGLE_CLIENT_SECRET'),
      callbackURL:
        config.get('NODE_ENV') === 'development'
          ? config.get('GOOGLE_CALLBACK_URL_DEV')
          : config.get('GOOGLE_CALLBACK_URL_PROD'),
      scope: ['email', 'profile'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { email, name } = profile._json;

    try {
      const user = await this.prisma.user.findUnique({
        where: {
          email: email,
        },
      });

      if (!user) {
        const user = await this.prisma.user.create({
          data: {
            email: email,
            name: name,
            password: await hash('-'),
          },
        });

        return done(null, user);
      }

      done(null, user);
    } catch (error) {
      throw new InternalServerErrorException('Internal server error');
    }
  }
}
