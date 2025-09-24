import { Controller, Get, HttpStatus, HttpException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CsrfService } from './csrf.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly csrfService: CsrfService) { }

    @Get('csrf')
    @ApiOperation({ summary: 'Get CSRF token' })
    @ApiResponse({
        status: 200,
        description: 'CSRF token generated successfully',
        schema: {
            type: 'object',
            properties: {
                token: {
                    type: 'string',
                    description: 'CSRF token to be included in subsequent requests'
                }
            }
        }
    })
    async getCsrfToken(): Promise<{ token: string }> {
        try {
            const token = this.csrfService.generateToken();
            return { token };
        } catch (error) {
            throw new HttpException(
                'Failed to generate CSRF token',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}
