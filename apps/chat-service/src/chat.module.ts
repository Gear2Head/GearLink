import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { MessageGateway } from './message.gateway';
import { RedisService } from './redis.service';
import { KafkaService } from './kafka.service';
import { PrismaClient } from '@gearlink/prisma';

@Module({
    imports: [
        ConfigModule.forRoot(),
        JwtModule.register({
            secret: process.env.JWT_SECRET,
        }),
    ],
    controllers: [ChatController],
    providers: [
        ChatService,
        MessageGateway,
        RedisService,
        KafkaService,
        {
            provide: PrismaClient,
            useValue: new PrismaClient(),
        },
    ],
})
export class ChatModule { }
