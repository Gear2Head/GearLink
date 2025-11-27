import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { MediaModule } from './media.module';

async function bootstrap() {
    const app = await NestFactory.create(MediaModule);

    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        transform: true,
    }));

    app.enableCors({
        origin: process.env.API_GATEWAY_CORS_ORIGIN?.split(',') || '*',
        credentials: true,
    });

    const port = process.env.MEDIA_SERVICE_PORT || 3005;
    await app.listen(port);

    console.log(`📁 Media Service running on port ${port}`);
}

bootstrap();
