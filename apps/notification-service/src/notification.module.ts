import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { FcmService } from './fcm.service';
import { ApnsService } from './apns.service';
import { KafkaConsumer } from './kafka.consumer';
import { PrismaClient } from '@gearlink/prisma';

@Module({
    imports: [
        ConfigModule.forRoot(),
        JwtModule.register({
            secret: process.env.JWT_SECRET,
        }),
    ],
    controllers: [NotificationController],
    providers: [
        NotificationService,
        FcmService,
        ApnsService,
        KafkaConsumer,
        {
            provide: PrismaClient,
            useValue: new PrismaClient(),
        },
    ],
})
export class NotificationModule { }
