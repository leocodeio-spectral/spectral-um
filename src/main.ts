import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ApplicationExceptionFilter } from './common/exception/filters/application.exception.filter';
import { DomainExceptionFilter } from './common/exception/filters/domain.exception.filter';
import { DatabaseExceptionFilter } from './common/exception/filters/database.exception.filter';
import { LoggingInterceptor } from './utils/logging/logging.interceptor';
import { LoggerService } from './utils/logging/logger.service';
import { ResponseService } from './common/services/response.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // Create and configure services
  const logger = await app.resolve(LoggerService);
  const responseService = await app.resolve(ResponseService);
  
  app.useLogger(logger);

  // Global interceptors
  app.useGlobalInterceptors(new LoggingInterceptor(logger));

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Spectral API')
    .setDescription('The Spectral API description')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('creators', 'Creator management endpoints')
    .addTag('editors', 'Editor management endpoints')
    .addTag('auth', 'Authentication endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customSiteTitle: 'Spectral API Docs',
  });

  // Global exception filters with logger and response service
  app.useGlobalFilters(
    new ApplicationExceptionFilter(logger, responseService),
    new DomainExceptionFilter(logger),
    new DatabaseExceptionFilter(logger),
  );

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Enable CORS
  app.enableCors();

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(`Swagger documentation is available at: http://localhost:${port}/api/docs`);
}
bootstrap();
