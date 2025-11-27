import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@gearlink/prisma';
import { UpdateUserDto } from '@gearlink/common';

@Injectable()
export class UserService {
    constructor(private prisma: PrismaClient) { }

    async getUserProfile(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                settings: true,
                devices: {
                    where: { lastActiveAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
                    select: {
                        id: true,
                        deviceName: true,
                        deviceType: true,
                        lastActiveAt: true,
                    },
                },
            },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return user;
    }

    async updateProfile(userId: string, dto: UpdateUserDto) {
        const user = await this.prisma.user.update({
            where: { id: userId },
            data: {
                username: dto.username,
                displayName: dto.displayName,
                bio: dto.bio,
                avatarUrl: dto.avatarUrl,
            },
            include: {
                settings: true,
            },
        });

        return user;
    }

    async getUserById(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                phoneNumber: true,
                username: true,
                displayName: true,
                bio: true,
                avatarUrl: true,
                lastSeenAt: true,
            },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return user;
    }

    async searchUsers(query: string) {
        const users = await this.prisma.user.findMany({
            where: {
                OR: [
                    { username: { contains: query, mode: 'insensitive' } },
                    { displayName: { contains: query, mode: 'insensitive' } },
                    { phoneNumber: { contains: query } },
                ],
                status: 'ACTIVE',
            },
            select: {
                id: true,
                username: true,
                displayName: true,
                avatarUrl: true,
            },
            take: 20,
        });

        return users;
    }
}
