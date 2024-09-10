import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { PORT } from './config/env.config';
import * as cors from 'cors';

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
  // app.enableCors({
  //   origin: ['http://localhost:3000', 'https://pf-grupo03.vercel.app/', 'https://travelzone-git-develop-grupo03s-projects.vercel.app/', 'http://localhost:3006', 'http://localhost:3000/dashboard/profile'], 
  //   credentials: true,
  // });

  app.enableCors({
    origin: '*', // Si quieres permitir todas las URLs
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], // Métodos permitidos
    allowedHeaders: ['Content-Type', 'Authorization'], // Encabezados permitidos
    credentials: true, // Si necesitas enviar cookies o credenciales
    optionsSuccessStatus: 204, // Estatus para las respuestas preflight exitosas
  });

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
