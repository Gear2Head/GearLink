import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { UserModule } from './user.module';

async function bootstrap() {
    const app = await NestFactory.create(UserModule);

    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        transform: true,
    }));

    app.enableCors({
        origin: process.env.API_GATEWAY_CORS_ORIGIN?.split(',') || '*',
        credentials: true,
    });

    const port = process.env.USER_SERVICE_PORT || 3002;
    await app.listen(port);

    console.log(`👤 User Service running on port ${port}`);
}

bootstrap();
