import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import * as compression from 'compression';
import { AppModule } from './app.module';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('Pictohub API')
    .setDescription(
      'Pictohub API lets you access data from the Pictohub database. The pictohub database provides you all the ARASAAC pictograms and their translations in different languages with more examples and information.',
    )
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Add CORS to the app
  app.enableCors();
  app.use(compression());
  app.use(helmet());
  await app.listen(3001);
}
bootstrap();
