import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ChatModule } from './chat.module';
import { RedisIoAdapter } from './redis.adapter';

async function bootstrap() {
    const app = await NestFactory.create(ChatModule);

    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        transform: true,
    }));

    app.enableCors({
        origin: process.env.API_GATEWAY_CORS_ORIGIN?.split(',') || '*',
        credentials: true,
    });

    // Use Redis adapter for Socket.IO scaling
    const redisIoAdapter = new RedisIoAdapter(app);
    await redisIoAdapter.connectToRedis();
    app.useWebSocketAdapter(redisIoAdapter);

    const port = process.env.CHAT_SERVICE_PORT || 3003;
    await app.listen(port);

    console.log(`💬 Chat Service running on port ${port}`);
}

bootstrap();
