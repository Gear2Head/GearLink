import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AuthModule } from './auth.module';

async function bootstrap() {
    const app = await NestFactory.create(AuthModule);

    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        transform: true,
    }));

    app.enableCors({
        origin: process.env.API_GATEWAY_CORS_ORIGIN?.split(',') || '*',
        credentials: true,
    });

    const port = process.env.AUTH_SERVICE_PORT || 3001;
    await app.listen(port);

    console.log(`🔐 Auth Service running on port ${port}`);
}

bootstrap();
