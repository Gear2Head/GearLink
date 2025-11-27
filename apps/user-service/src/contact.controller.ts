import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ContactService } from './contact.service';
import { JwtAuthGuard, CurrentUserId } from '@gearlink/common';

@Controller('contacts')
@UseGuards(JwtAuthGuard)
export class ContactController {
    constructor(private readonly contactService: ContactService) { }

    @Get()
    async getContacts(@CurrentUserId() userId: string) {
        return this.contactService.getContacts(userId);
    }

    @Post()
    async addContact(
        @CurrentUserId() userId: string,
        @Body() dto: { contactId: string; displayName?: string },
    ) {
        return this.contactService.addContact(userId, dto.contactId, dto.displayName);
    }

    @Delete(':contactId')
    async removeContact(
        @CurrentUserId() userId: string,
        @Param('contactId') contactId: string,
    ) {
        return this.contactService.removeContact(userId, contactId);
    }

    @Post(':contactId/block')
    async blockContact(
        @CurrentUserId() userId: string,
        @Param('contactId') contactId: string,
    ) {
        return this.contactService.blockContact(userId, contactId);
    }

    @Post(':contactId/unblock')
    async unblockContact(
        @CurrentUserId() userId: string,
        @Param('contactId') contactId: string,
    ) {
        return this.contactService.unblockContact(userId, contactId);
    }
}
