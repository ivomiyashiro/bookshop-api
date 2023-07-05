import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // anables to inject this module globally
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
