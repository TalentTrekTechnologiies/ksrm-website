import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Allow frontend to call this backend
  app.enableCors({
    origin: 'http://localhost:3000',
  });

  // Backend runs on port 4000
  await app.listen(4000);
}
bootstrap();