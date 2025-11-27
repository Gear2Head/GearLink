import { Controller, Get, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto, JwtAuthGuard, CurrentUserId } from '@gearlink/common';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Get('me')
    async getProfile(@CurrentUserId() userId: string) {
        return this.userService.getUserProfile(userId);
    }

    @Patch('me')
    async updateProfile(
        @CurrentUserId() userId: string,
        @Body() dto: UpdateUserDto,
    ) {
        return this.userService.updateProfile(userId, dto);
    }

    @Get(':id')
    async getUserById(@Param('id') id: string) {
        return this.userService.getUserById(id);
    }

    @Get('search/:query')
    async searchUsers(@Param('query') query: string) {
        return this.userService.searchUsers(query);
    }
}
