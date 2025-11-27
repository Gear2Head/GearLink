import { hash, compare } from 'bcrypt';
import { randomBytes } from 'crypto';

export class CryptoUtils {
    static async hashPassword(password: string): Promise<string> {
        const rounds = parseInt(process.env.BCRYPT_ROUNDS || '10', 10);
        return hash(password, rounds);
    }

    static async comparePassword(password: string, hash: string): Promise<boolean> {
        return compare(password, hash);
    }

    static generateRandomCode(length: number = 6): string {
        const digits = '0123456789';
        let code = '';
        const bytes = randomBytes(length);

        for (let i = 0; i < length; i++) {
            code += digits[bytes[i] % digits.length];
        }

        return code;
    }

    static generateRandomToken(length: number = 32): string {
        return randomBytes(length).toString('hex');
    }
}

export class DateUtils {
    static addMinutes(date: Date, minutes: number): Date {
        return new Date(date.getTime() + minutes * 60000);
    }

    static addDays(date: Date, days: number): Date {
        return new Date(date.getTime() + days * 86400000);
    }

    static isExpired(date: Date): boolean {
        return date.getTime() < Date.now();
    }
}

export class PhoneUtils {
    static normalizePhoneNumber(phoneNumber: string): string {
        // Remove all non-digit characters except +
        return phoneNumber.replace(/[^\d+]/g, '');
    }

    static formatPhoneNumber(phoneNumber: string, country: string): string {
        // Simple formatting - in production use libphonenumber-js
        const normalized = this.normalizePhoneNumber(phoneNumber);
        return normalized.startsWith('+') ? normalized : `+${normalized}`;
    }
}
