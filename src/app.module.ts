import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AtGuard } from './common/guard';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { BookModule } from './book/book.module';
import { PaymentModule } from './payment/payment.module';
import { OrdersModule } from './order/order.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UserModule,
    BookModule,
    PaymentModule,
    OrdersModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AtGuard,
    },
  ],
})
export class AppModule {}
