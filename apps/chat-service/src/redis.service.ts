import { Injectable, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit {
    private client: Redis;

    onModuleInit() {
        this.client = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    }

    async setUserOnline(userId: string, socketId: string) {
        await this.client.sadd(`user:${userId}:sockets`, socketId);
        await this.client.set(`user:${userId}:online`, 'true');
    }

    async setUserOffline(userId: string, socketId: string) {
        await this.client.srem(`user:${userId}:sockets`, socketId);
        const count = await this.client.scard(`user:${userId}:sockets`);
        if (count === 0) {
            await this.client.del(`user:${userId}:online`);
        }
    }

    async incrSequence(conversationId: string): Promise<number> {
        return this.client.incr(`conversation:${conversationId}:seq`);
    }
}
