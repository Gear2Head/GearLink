import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { PrismaClient } from '@gearlink/prisma';

describe('Auth Service Integration Tests', () => {
    let prisma: PrismaClient;
    const testPhone = '+905559999999';

    beforeAll(async () => {
        prisma = new PrismaClient();
    });

    afterAll(async () => {
        // Cleanup
        await prisma.user.deleteMany({
            where: { phoneNumber: testPhone },
        });
        await prisma.$disconnect();
    });

    it('should send verification code', async () => {
        const response = await fetch('http://localhost:3001/auth/verify-phone', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                phoneNumber: testPhone,
                phoneCountry: 'TR',
            }),
        });

        const data = await response.json();
        expect(response.status).toBe(200);
        expect(data.message).toBe('Verification code sent');
    });

    it('should create user on code confirmation', async () => {
        // Get verification code from database
        const verification = await prisma.verificationCode.findFirst({
            where: { phoneNumber: testPhone },
            orderBy: { createdAt: 'desc' },
        });

        expect(verification).toBeTruthy();

        const response = await fetch('http://localhost:3001/auth/confirm-code', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                phoneNumber: testPhone,
                code: verification!.code,
                deviceId: 'test-device-1',
                deviceName: 'Test Device',
            }),
        });

        const data = await response.json();
        expect(response.status).toBe(200);
        expect(data.accessToken).toBeTruthy();
        expect(data.refreshToken).toBeTruthy();
    });
});
