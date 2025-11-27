import { PrismaClient, UserStatus, DeviceType, ConversationType, ParticipantRole, MessageType, DeliveryStatus } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Create test users
    const user1 = await prisma.user.create({
        data: {
            phoneNumber: '+905551234567',
            phoneCountry: 'TR',
            username: 'kadir',
            displayName: 'Kadir',
            bio: 'Developer',
            status: UserStatus.ACTIVE,
            settings: {
                create: {
                    profilePhotoVisibility: 'EVERYONE',
                    statusVisibility: 'EVERYONE',
                    lastSeenVisibility: 'EVERYONE',
                    readReceiptsEnabled: true,
                    notificationsEnabled: true,
                    messageNotifications: true,
                    groupNotifications: true,
                },
            },
        },
    });

    const user2 = await prisma.user.create({
        data: {
            phoneNumber: '+905559876543',
            phoneCountry: 'TR',
            username: 'kubra_ai',
            displayName: 'Kübra AI',
            bio: 'AI Assistant',
            status: UserStatus.ACTIVE,
            settings: {
                create: {
                    profilePhotoVisibility: 'EVERYONE',
                    statusVisibility: 'EVERYONE',
                    lastSeenVisibility: 'NOBODY',
                    readReceiptsEnabled: true,
                    notificationsEnabled: true,
                    messageNotifications: true,
                    groupNotifications: true,
                },
            },
        },
    });

    const user3 = await prisma.user.create({
        data: {
            phoneNumber: '+905551112233',
            phoneCountry: 'TR',
            username: 'friend1',
            displayName: 'Friend 1',
            status: UserStatus.ACTIVE,
            settings: {
                create: {},
            },
        },
    });

    console.log('✅ Created users:', { user1: user1.id, user2: user2.id, user3: user3.id });

    // Create devices
    const device1 = await prisma.device.create({
        data: {
            userId: user1.id,
            deviceId: 'device-1-mobile',
            deviceName: 'iPhone 15 Pro',
            deviceType: DeviceType.MOBILE,
            platform: 'iOS',
            appVersion: '1.0.0',
            pushProvider: 'APNS',
        },
    });

    const device2 = await prisma.device.create({
        data: {
            userId: user2.id,
            deviceId: 'device-2-web',
            deviceName: 'Chrome Browser',
            deviceType: DeviceType.WEB,
            platform: 'Web',
            appVersion: '1.0.0',
        },
    });

    console.log('✅ Created devices');

    // Create contacts
    await prisma.contact.create({
        data: {
            userId: user1.id,
            contactId: user2.id,
            displayName: 'Kübra ❤️',
            isFavorite: true,
        },
    });

    await prisma.contact.create({
        data: {
            userId: user1.id,
            contactId: user3.id,
        },
    });

    await prisma.contact.create({
        data: {
            userId: user2.id,
            contactId: user1.id,
            displayName: 'Kadir',
        },
    });

    console.log('✅ Created contacts');

    // Create a private conversation
    const conversation1 = await prisma.conversation.create({
        data: {
            type: ConversationType.PRIVATE,
            participants: {
                create: [
                    {
                        userId: user1.id,
                        role: ParticipantRole.MEMBER,
                    },
                    {
                        userId: user2.id,
                        role: ParticipantRole.MEMBER,
                    },
                ],
            },
        },
    });

    console.log('✅ Created private conversation:', conversation1.id);

    // Create messages
    const message1 = await prisma.message.create({
        data: {
            conversationId: conversation1.id,
            senderId: user1.id,
            type: MessageType.TEXT,
            content: 'Merhaba Kübra, nasılsın?',
            sequenceNumber: 1,
            deliveries: {
                create: [
                    {
                        userId: user2.id,
                        status: DeliveryStatus.DELIVERED,
                        deliveredAt: new Date(),
                    },
                ],
            },
        },
    });

    const message2 = await prisma.message.create({
        data: {
            conversationId: conversation1.id,
            senderId: user2.id,
            type: MessageType.TEXT,
            content: 'Merhaba Kadir! Ben iyiyim, sen nasılsın?',
            sequenceNumber: 2,
            deliveries: {
                create: [
                    {
                        userId: user1.id,
                        status: DeliveryStatus.READ,
                        deliveredAt: new Date(),
                        readAt: new Date(),
                    },
                ],
            },
        },
    });

    const message3 = await prisma.message.create({
        data: {
            conversationId: conversation1.id,
            senderId: user1.id,
            type: MessageType.TEXT,
            content: 'Ben de iyiyim, teşekkür ederim ❤️',
            sequenceNumber: 3,
            replyToId: message2.id,
            deliveries: {
                create: [
                    {
                        userId: user2.id,
                        status: DeliveryStatus.SENT,
                    },
                ],
            },
        },
    });

    console.log('✅ Created messages');

    // Create a group conversation
    const groupConversation = await prisma.conversation.create({
        data: {
            type: ConversationType.GROUP,
            name: 'Arkadaşlar',
            description: 'Arkadaş grubu',
            participants: {
                create: [
                    {
                        userId: user1.id,
                        role: ParticipantRole.ADMIN,
                    },
                    {
                        userId: user2.id,
                        role: ParticipantRole.MEMBER,
                    },
                    {
                        userId: user3.id,
                        role: ParticipantRole.MEMBER,
                    },
                ],
            },
        },
    });

    await prisma.message.create({
        data: {
            conversationId: groupConversation.id,
            senderId: user1.id,
            type: MessageType.SYSTEM,
            content: 'Kadir created the group',
            sequenceNumber: 1,
        },
    });

    await prisma.message.create({
        data: {
            conversationId: groupConversation.id,
            senderId: user1.id,
            type: MessageType.TEXT,
            content: 'Herkese merhaba! 👋',
            sequenceNumber: 2,
            deliveries: {
                create: [
                    {
                        userId: user2.id,
                        status: DeliveryStatus.DELIVERED,
                        deliveredAt: new Date(),
                    },
                    {
                        userId: user3.id,
                        status: DeliveryStatus.SENT,
                    },
                ],
            },
        },
    });

    console.log('✅ Created group conversation');

    // Create some pre-keys for E2EE
    for (let i = 0; i < 10; i++) {
        await prisma.preKey.create({
            data: {
                userId: user1.id,
                keyId: i,
                publicKey: `mock-public-key-${i}`,
            },
        });
    }

    console.log('✅ Created pre-keys');

    console.log('🎉 Seeding completed successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
