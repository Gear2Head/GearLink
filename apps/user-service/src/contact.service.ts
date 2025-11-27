import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaClient } from '@gearlink/prisma';

@Injectable()
export class ContactService {
    constructor(private prisma: PrismaClient) { }

    async getContacts(userId: string) {
        const contacts = await this.prisma.contact.findMany({
            where: { userId },
            include: {
                contact: {
                    select: {
                        id: true,
                        username: true,
                        displayName: true,
                        avatarUrl: true,
                        lastSeenAt: true,
                    },
                },
            },
            orderBy: {
                displayName: 'asc',
            },
        });

        return contacts;
    }

    async addContact(userId: string, contactId: string, displayName?: string) {
        // Check if already exists
        const existing = await this.prisma.contact.findUnique({
            where: {
                userId_contactId: {
                    userId,
                    contactId,
                },
            },
        });

        if (existing) {
            throw new ConflictException('Contact already exists');
        }

        const contact = await this.prisma.contact.create({
            data: {
                userId,
                contactId,
                displayName,
            },
            include: {
                contact: {
                    select: {
                        id: true,
                        username: true,
                        displayName: true,
                        avatarUrl: true,
                    },
                },
            },
        });

        return contact;
    }

    async removeContact(userId: string, contactId: string) {
        await this.prisma.contact.delete({
            where: {
                userId_contactId: {
                    userId,
                    contactId,
                },
            },
        });

        return { success: true };
    }

    async blockContact(userId: string, contactId: string) {
        const contact = await this.prisma.contact.update({
            where: {
                userId_contactId: {
                    userId,
                    contactId,
                },
            },
            data: {
                isBlocked: true,
            },
        });

        return contact;
    }

    async unblockContact(userId: string, contactId: string) {
        const contact = await this.prisma.contact.update({
            where: {
                userId_contactId: {
                    userId,
                    contactId,
                },
            },
            data: {
                isBlocked: false,
            },
        });

        return contact;
    }
}
