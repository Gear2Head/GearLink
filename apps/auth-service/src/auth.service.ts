import { Injectable, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient, User, DeviceType } from '@gearlink/prisma';
import { SmsService } from './sms.service';
import { ConfirmCodeDto, AuthTokens, RegisterEmailDto } from '@gearlink/common';
import { PhoneUtils, CryptoUtils } from '@gearlink/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaClient,
        private jwtService: JwtService,
        private smsService: SmsService,
    ) { }

    // Phone Auth
    async sendVerificationCode(phoneNumber: string, country: string) {
        const normalizedPhone = PhoneUtils.normalizePhoneNumber(phoneNumber, country);
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

        await this.prisma.verificationCode.create({
            data: {
                phoneNumber: normalizedPhone,
                code,
                expiresAt,
            },
        });

        await this.smsService.sendVerificationCode(normalizedPhone, code);

        return { message: 'Verification code sent', phoneNumber: normalizedPhone };
    }

    async verifyCode(dto: ConfirmCodeDto): Promise<AuthTokens> {
        const normalizedPhone = PhoneUtils.normalizePhoneNumber(dto.phoneNumber);

        const verification = await this.prisma.verificationCode.findFirst({
            where: {
                phoneNumber: normalizedPhone,
                code: dto.code,
                verified: false,
                expiresAt: { gt: new Date() },
            },
        });

        if (!verification) {
            throw new BadRequestException('Invalid or expired code');
        }

        await this.prisma.verificationCode.update({
            where: { id: verification.id },
            data: { verified: true },
        });

        let user = await this.prisma.user.findUnique({
            where: { phoneNumber: normalizedPhone },
        });

        if (!user) {
            user = await this.prisma.user.create({
                data: {
                    phoneNumber: normalizedPhone,
                    phoneCountry: 'TR', // Default or extract from phone
                },
            });
        }

        return this.generateTokens(user, dto.deviceId, dto.deviceName);
    }

    // Email Auth
    async registerEmail(dto: RegisterEmailDto): Promise<AuthTokens> {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        if (existingUser) {
            throw new ConflictException('Email already in use');
        }

        const hashedPassword = await bcrypt.hash(dto.password, 10);

        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                password: hashedPassword,
                displayName: dto.displayName,
                username: dto.email.split('@')[0] + Math.floor(Math.random() * 1000),
            },
        });

        return this.generateTokens(user, dto.deviceId, dto.deviceName);
    }

    async validateUser(email: string, pass: string): Promise<User | null> {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });

        if (user && user.password && (await bcrypt.compare(pass, user.password))) {
            const { password, ...result } = user;
            return result as User;
        }
        return null;
    }

    async login(user: User, deviceId: string, deviceName?: string) {
        return this.generateTokens(user, deviceId, deviceName);
    }

    // Google Auth
    async validateGoogleUser(googleUser: {
        email: string;
        firstName: string;
        lastName: string;
        picture: string;
        googleId: string;
    }): Promise<User> {
        let user = await this.prisma.user.findUnique({
            where: { googleId: googleUser.googleId },
        });

        if (!user) {
            // Check if email exists
            user = await this.prisma.user.findUnique({
                where: { email: googleUser.email },
            });

            if (user) {
                // Link Google account
                user = await this.prisma.user.update({
                    where: { id: user.id },
                    data: { googleId: googleUser.googleId },
                });
            } else {
                // Create new user
                user = await this.prisma.user.create({
                    data: {
                        email: googleUser.email,
                        googleId: googleUser.googleId,
                        displayName: `${googleUser.firstName} ${googleUser.lastName}`,
                        avatarUrl: googleUser.picture,
                        username: googleUser.email.split('@')[0] + Math.floor(Math.random() * 1000),
                        emailVerified: true,
                    },
                });
            }
        }

        return user;
    }

    async completeSocialLogin(userId: string, deviceId: string, deviceName?: string) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new UnauthorizedException();
        return this.generateTokens(user, deviceId, deviceName);
    }

    // Common
    async refreshTokens(refreshToken: string, deviceId: string): Promise<AuthTokens> {
        const tokenRecord = await this.prisma.refreshToken.findUnique({
            where: { token: refreshToken },
            include: { device: true },
        });

        if (!tokenRecord || tokenRecord.expiresAt < new Date() || tokenRecord.revokedAt) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        if (tokenRecord.deviceId !== deviceId) {
            throw new UnauthorizedException('Invalid device');
        }

        // Revoke old token
        await this.prisma.refreshToken.update({
            where: { id: tokenRecord.id },
            data: { revokedAt: new Date() },
        });

        const user = await this.prisma.user.findUnique({
            where: { id: tokenRecord.device.userId },
        });

        if (!user) throw new UnauthorizedException();

        return this.generateTokens(user, deviceId, tokenRecord.device.deviceName || undefined);
    }

    async logout(refreshToken: string) {
        await this.prisma.refreshToken.update({
            where: { token: refreshToken },
            data: { revokedAt: new Date() },
        });
        return { success: true };
    }

    private async generateTokens(user: User, deviceId: string, deviceName?: string): Promise<AuthTokens> {
        // Determine device type
        let deviceType = DeviceType.MOBILE;
        if (deviceId.startsWith('web-')) deviceType = DeviceType.WEB;
        if (deviceId.startsWith('desktop-')) deviceType = DeviceType.DESKTOP;

        // Find or create device
        let device = await this.prisma.device.findUnique({
            where: { deviceId },
        });

        if (device) {
            if (device.userId !== user.id) {
                // Device ownership changed? Or collision?
                // For now, update ownership
                await this.prisma.device.update({
                    where: { id: device.id },
                    data: { userId: user.id, lastActiveAt: new Date() },
                });
            } else {
                await this.prisma.device.update({
                    where: { id: device.id },
                    data: { lastActiveAt: new Date() },
                });
            }
        } else {
            device = await this.prisma.device.create({
                data: {
                    userId: user.id,
                    deviceId,
                    deviceName: deviceName || 'Unknown Device',
                    deviceType,
                },
            });
        }

        const payload = { sub: user.id, deviceId };
        const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
        const refreshToken = CryptoUtils.generateRefreshToken();

        await this.prisma.refreshToken.create({
            data: {
                token: refreshToken,
                deviceId: device.id,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            },
        });

        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                phoneNumber: user.phoneNumber,
                username: user.username,
                displayName: user.displayName,
                avatarUrl: user.avatarUrl,
            },
        };
    }
}
