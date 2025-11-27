import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { S3Service } from './s3.service';
import { KafkaService } from './kafka.service';
import { PrismaClient } from '@gearlink/prisma';

@Module({
    imports: [
        ConfigModule.forRoot(),
        JwtModule.register({
            secret: process.env.JWT_SECRET,
        }),
    ],
    controllers: [MediaController],
    providers: [
        MediaService,
        S3Service,
        KafkaService,
        {
            provide: PrismaClient,
            useValue: new PrismaClient(),
        },
    ],
})
export class MediaModule { }
