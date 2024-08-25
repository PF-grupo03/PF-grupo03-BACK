import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const options = new DocumentBuilder()
    .setTitle('NestJS API')
    .setDescription('Proyecto Final Grupo03 Travel Zone')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);

  app.enableCors({origin: 'http://localhost:3000/', // Permitir solicitudes desde este origen
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Permitir envío de cookies y cabeceras de autorización
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );
  const port = process.env.PORT || 3006;
  await app.listen(port);
  console.log(`Server running on port ${port}`);
}
bootstrap();
