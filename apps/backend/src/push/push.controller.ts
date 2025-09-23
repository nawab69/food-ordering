import {
    Controller,
    Get,
    Post,
    Delete,
    Body,
    HttpStatus,
    HttpException,
    UseGuards,
    Req
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiSecurity
} from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Request } from 'express';
import { PushService } from './push.service';
import { PushSubscriptionDto, PushPublicKeyDto } from '../common/dto/push.dto';
import { CsrfGuard } from '../auth/csrf.guard';

@ApiTags('push')
@Controller('push')
@UseGuards(ThrottlerGuard)
export class PushController {
    constructor(private readonly pushService: PushService) { }

    @Post('subscribe')
    @UseGuards(CsrfGuard)
    @ApiOperation({ summary: 'Subscribe to push notifications' })
    @ApiSecurity('csrf-token')
    @ApiResponse({
        status: 201,
        description: 'Successfully subscribed to push notifications'
    })
    @ApiResponse({ status: 400, description: 'Invalid subscription data' })
    @ApiResponse({ status: 403, description: 'CSRF token required' })
    async subscribe(@Body() subscriptionDto: PushSubscriptionDto) {
        try {
            const result = await this.pushService.subscribe(subscriptionDto);
            return result;
        } catch (error) {
            throw new HttpException(
                'Failed to subscribe to push notifications',
                HttpStatus.BAD_REQUEST
            );
        }
    }

    @Delete('subscribe')
    @UseGuards(CsrfGuard)
    @ApiOperation({ summary: 'Unsubscribe from push notifications' })
    @ApiSecurity('csrf-token')
    @ApiResponse({
        status: 200,
        description: 'Successfully unsubscribed from push notifications'
    })
    @ApiResponse({ status: 403, description: 'CSRF token required' })
    async unsubscribe(@Req() request: Request) {
        try {
            // In a real app, you might get the endpoint from the request body or auth context
            // For now, we'll extract it from the request if available
            const endpoint = request.body?.endpoint;
            const result = await this.pushService.unsubscribe(endpoint);
            return result;
        } catch (error) {
            throw new HttpException(
                'Failed to unsubscribe from push notifications',
                HttpStatus.BAD_REQUEST
            );
        }
    }

    @Get('publicKey')
    @ApiOperation({ summary: 'Get VAPID public key for push subscriptions' })
    @ApiResponse({
        status: 200,
        description: 'VAPID public key',
        type: PushPublicKeyDto
    })
    async getPublicKey(): Promise<PushPublicKeyDto> {
        try {
            const publicKey = await this.pushService.getPublicKey();
            return { publicKey };
        } catch (error) {
            throw new HttpException(
                'Push notifications not configured',
                HttpStatus.SERVICE_UNAVAILABLE
            );
        }
    }
}
