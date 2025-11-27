import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
    ConnectedSocket,
    MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from './redis.service';

@WebSocketGateway({
    cors: { origin: '*' },
    namespace: 'chat',
})
export class MessageGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    constructor(
        private jwtService: JwtService,
        private redis: RedisService,
    ) { }

    async handleConnection(client: Socket) {
        try {
            const token = client.handshake.auth.token || client.handshake.headers.authorization?.split(' ')[1];
            if (!token) {
                client.disconnect();
                return;
            }

            const payload = this.jwtService.verify(token);
            client.data.userId = payload.sub;
            client.data.deviceId = payload.deviceId;

            await this.redis.setUserOnline(payload.sub, client.id);
            client.join(`user:${payload.sub}`);

            console.log(`Client connected: ${payload.sub}`);
        } catch (e) {
            client.disconnect();
        }
    }

    async handleDisconnect(client: Socket) {
        if (client.data.userId) {
            await this.redis.setUserOffline(client.data.userId, client.id);
        }
    }

    @SubscribeMessage('message:send')
    async handleMessage(@ConnectedSocket() client: Socket, @MessageBody() payload: any) {
        // Handled by Controller usually, but can be here for pure WS
    }

    @SubscribeMessage('typing:start')
    async handleTypingStart(@ConnectedSocket() client: Socket, @MessageBody() payload: { conversationId: string }) {
        client.to(`conversation:${payload.conversationId}`).emit('typing:start', {
            userId: client.data.userId,
            conversationId: payload.conversationId,
        });
    }

    broadcastMessage(conversationId: string, message: any) {
        this.server.to(`conversation:${conversationId}`).emit('message:new', message);
        // Also send to individual users if not in room yet (push notification logic handles offline)
    }
}
