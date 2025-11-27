import { io, Socket } from 'socket.io-client';
import { store } from '../store';
import { addMessage } from '../store/chat.slice';

class WebSocketService {
    private socket: Socket | null = null;

    connect(token: string) {
        if (this.socket?.connected) return;

        this.socket = io('http://localhost:3003', {
            auth: { token },
            transports: ['websocket'],
        });

        this.socket.on('connect', () => {
            console.log('Connected to WebSocket');
        });

        this.socket.on('message:new', (message: any) => {
            store.dispatch(addMessage({
                conversationId: message.conversationId,
                message,
            }));
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from WebSocket');
        });
    }

    sendMessage(conversationId: string, content: string, type: string = 'TEXT') {
        if (!this.socket?.connected) return;

        this.socket.emit('message:send', {
            conversationId,
            content,
            type,
        });
    }

    disconnect() {
        this.socket?.disconnect();
        this.socket = null;
    }
}

export const webSocketService = new WebSocketService();
