import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from 'dotenv';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  app.enableCors({
    origin: ['http://localhost:5173', 'http://192.168.0.118:5173'],
  });
  config();
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
