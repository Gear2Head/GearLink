import { Controller, Post, Get, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard, CurrentUserId } from '@gearlink/common';
import { CreateConversationDto, SendMessageDto } from '@gearlink/common';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
    constructor(private readonly chatService: ChatService) { }

    @Post('conversations')
    async createConversation(
        @CurrentUserId() userId: string,
        @Body() dto: CreateConversationDto,
    ) {
        return this.chatService.createConversation(userId, dto);
    }

    @Get('conversations')
    async getConversations(@CurrentUserId() userId: string) {
        return this.chatService.getUserConversations(userId);
    }

    @Get('conversations/:id/messages')
    async getMessages(
        @CurrentUserId() userId: string,
        @Param('id') conversationId: string,
        @Query('limit') limit?: number,
        @Query('before') before?: string,
    ) {
        return this.chatService.getMessages(userId, conversationId, limit, before);
    }

    @Post('messages')
    async sendMessage(
        @CurrentUserId() userId: string,
        @Body() dto: SendMessageDto,
    ) {
        return this.chatService.sendMessage(userId, dto);
    }
}
