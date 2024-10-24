import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  app.use(cookieParser(configService.get<string>('COOKIE_SECRET')));
  app.use(helmet());
  app.enableCors({
    credentials: true,
    origin:
      process.env.NODE_ENV === 'production'
        ? configService.get<string[]>('corsOrigins')
        : ['http://localhost:3000', 'http://localhost:4200'],
  });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
  const swaggerConfig = new DocumentBuilder()
    .setTitle('NestJS Authentication API')
    .setDescription('An OAuth2.0 authentication API made with NestJS')
    .setVersion('0.0.1')
    .addBearerAuth()
    .addTag('Authentication API')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);
  await app.listen(configService.get<number>('port'));
}
bootstrap();
