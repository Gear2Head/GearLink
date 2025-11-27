import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { ContactController } from './contact.controller';
import { ContactService } from './contact.service';
import { PrismaClient } from '@gearlink/prisma';

@Module({
    imports: [
        ConfigModule.forRoot(),
        JwtModule.register({
            secret: process.env.JWT_SECRET,
        }),
    ],
    controllers: [UserController, ContactController],
    providers: [
        UserService,
        ContactService,
        {
            provide: PrismaClient,
            useValue: new PrismaClient(),
        },
    ],
})
export class UserModule { }
