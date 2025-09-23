import { Controller, Get, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { CsrfService } from './csrf.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly csrfService: CsrfService) { }

    @Get('csrf')
    @ApiOperation({ summary: 'Get CSRF token' })
    @ApiResponse({
        status: 200,
        description: 'CSRF token generated and set in cookie',
        schema: {
            type: 'object',
            properties: {
                token: { type: 'string', description: 'CSRF token' }
            }
        }
    })
    getCsrfToken(@Res() response: Response) {
        const token = this.csrfService.generateToken();

        // Set token in httpOnly cookie
        response.cookie('csrf', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000, // 15 minutes
        });

        return response.json({ token });
    }
}
