import { Controller, Post, Body, UseGuards, Get, Req, Res, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { VerifyPhoneDto, ConfirmCodeDto, RefreshTokenDto, RegisterEmailDto } from '@gearlink/common';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    // Phone Authentication
    @Post('verify-phone')
    async verifyPhone(@Body() dto: VerifyPhoneDto) {
        return this.authService.sendVerificationCode(dto.phoneNumber, dto.phoneCountry);
    }

    @Post('confirm-code')
    async confirmCode(@Body() dto: ConfirmCodeDto) {
        return this.authService.verifyCode(dto);
    }

    // Email Authentication
    @Post('register-email')
    async registerEmail(@Body() dto: RegisterEmailDto) {
        return this.authService.registerEmail(dto);
    }

    @UseGuards(AuthGuard('local'))
    @Post('login-email')
    async loginEmail(@Req() req, @Body() body: { deviceId: string; deviceName?: string }) {
        return this.authService.login(req.user, body.deviceId, body.deviceName);
    }

    // Google Authentication
    @Get('google')
    @UseGuards(AuthGuard('google'))
    async googleAuth(@Req() req) { }

    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    async googleAuthRedirect(@Req() req, @Res() res: Response) {
        // In a real app, you'd redirect to a frontend URL with the token
        // or set a cookie. For now, we'll return JSON.
        // Since we need deviceId, this flow usually happens in a popup or webview
        // where the client provides deviceId via query param or state.
        // For simplicity, we'll assume a default device or handle it in the frontend callback.

        // NOTE: In a real mobile/web app, the client would handle the OAuth flow 
        // and send the access token to the backend, or use a deep link.
        // Here we'll just return the user info for the client to complete the login.

        const user = req.user;
        // We can't generate full tokens here without deviceId.
        // We'll redirect to a frontend page that will call a "complete-social-login" endpoint

        res.redirect(`${process.env.FRONTEND_URL}/auth/callback?userId=${user.id}`);
    }

    @Post('social-login-complete')
    async socialLoginComplete(@Body() body: { userId: string; deviceId: string; deviceName?: string }) {
        return this.authService.completeSocialLogin(body.userId, body.deviceId, body.deviceName);
    }

    // Common
    @Post('refresh')
    async refresh(@Body() dto: RefreshTokenDto) {
        return this.authService.refreshTokens(dto.refreshToken, dto.deviceId);
    }

    @Post('logout')
    async logout(@Body() body: { refreshToken: string }) {
        return this.authService.logout(body.refreshToken);
    }
}
