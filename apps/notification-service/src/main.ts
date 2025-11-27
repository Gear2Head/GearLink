import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NotificationModule } from './notification.module';

async function bootstrap() {
    const app = await NestFactory.create(NotificationModule);

    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        transform: true,
    }));

    app.enableCors({
        origin: process.env.API_GATEWAY_CORS_ORIGIN?.split(',') || '*',
        credentials: true,
    });

    const port = process.env.NOTIFICATION_SERVICE_PORT || 3006;
    await app.listen(port);

    console.log(`🔔 Notification Service running on port ${port}`);
}

bootstrap();
