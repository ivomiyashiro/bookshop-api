import { NestExpressApplication } from '@nestjs/platform-express';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors({
    credentials: true,
    origin: [
      'http://localhost:3000',
      'https://nobugsbooks.vercel.app',
      'https://dev-bookstore.onrender.com',
    ],
    allowedHeaders: 'Content-Type',
    methods: ['POST', 'GET', 'UPDATE', 'DELETE'],
  });
  app.set('trust proxy', 1);
  app.use(helmet());
  await app.listen(3030);
}

bootstrap();
