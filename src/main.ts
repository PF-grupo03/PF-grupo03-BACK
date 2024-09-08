import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { PORT } from './config/env.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });
  const options = new DocumentBuilder()
  .setTitle('NestJS API')
  .setDescription('Proyecto Final Grupo03 Travel Zone')
  .setVersion('1.0.0')
  .addBearerAuth()
  .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);
  app.enableCors({
    origin: ['http://localhost:3006'],  
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],  
    credentials: true,
  })

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );
  const port = PORT || 3006;
  await app.listen(port);
  console.log(`Server running on port ${port}`);
}
bootstrap();
