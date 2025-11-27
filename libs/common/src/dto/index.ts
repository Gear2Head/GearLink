import { IsString, IsNotEmpty, IsOptional, IsPhoneNumber, IsUUID, IsEnum, IsInt, Min, Max } from 'class-validator';

// Auth DTOs
export class VerifyPhoneDto {
    @IsPhoneNumber()
    @IsNotEmpty()
    phoneNumber: string;

    @IsString()
    @IsNotEmpty()
    phoneCountry: string;
}

export class ConfirmCodeDto {
    @IsPhoneNumber()
    @IsNotEmpty()
    phoneNumber: string;

    @IsString()
    @IsNotEmpty()
    code: string;

    @IsString()
    @IsNotEmpty()
    deviceId: string;

    @IsString()
    @IsOptional()
    deviceName?: string;

    @IsString()
    @IsOptional()
    pushToken?: string;
}

export class RefreshTokenDto {
    @IsString()
    @IsNotEmpty()
    refreshToken: string;

    @IsString()
    @IsNotEmpty()
    deviceId: string;
}

export class RegisterEmailDto {
    @IsString()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsString()
    @IsOptional()
    displayName?: string;

    @IsString()
    @IsNotEmpty()
    deviceId: string;

    @IsString()
    @IsOptional()
    deviceName?: string;
}

// User DTOs
export class UpdateUserDto {
    @IsString()
    @IsOptional()
    username?: string;

    @IsString()
    @IsOptional()
    displayName?: string;

    @IsString()
    @IsOptional()
    bio?: string;

    @IsString()
    @IsOptional()
    avatarUrl?: string;
}

// Message DTOs
export class SendMessageDto {
    @IsUUID()
    @IsNotEmpty()
    conversationId: string;

    @IsEnum(['TEXT', 'IMAGE', 'VIDEO', 'AUDIO', 'VOICE', 'DOCUMENT', 'LOCATION', 'CONTACT', 'STICKER'])
    @IsNotEmpty()
    type: string;

    @IsString()
    @IsNotEmpty()
    content: string;

    @IsString()
    @IsOptional()
    tempId?: string;

    @IsUUID()
    @IsOptional()
    replyToId?: string;
}

export class CreateConversationDto {
    @IsEnum(['PRIVATE', 'GROUP'])
    @IsNotEmpty()
    type: string;

    @IsString({ each: true })
    @IsNotEmpty()
    participantIds: string[];

    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    description?: string;
}

// Pagination DTOs
export class PaginationDto {
    @IsInt()
    @Min(1)
    @IsOptional()
    page?: number = 1;

    @IsInt()
    @Min(1)
    @Max(100)
    @IsOptional()
    limit?: number = 20;
}

export class MessagePaginationDto extends PaginationDto {
    @IsUUID()
    @IsNotEmpty()
    conversationId: string;

    @IsString()
    @IsOptional()
    before?: string; // Message ID to fetch messages before
}
