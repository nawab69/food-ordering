import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { CsrfService } from './csrf.service';

@Injectable()
export class CsrfGuard implements CanActivate {
    constructor(private readonly csrfService: CsrfService) { }

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest<Request>();

        console.log('CSRF Guard: Method:', request.method);
        console.log('CSRF Guard: Headers:', JSON.stringify(request.headers, null, 2));

        // Only apply CSRF protection to POST, PUT, DELETE requests
        if (!['POST', 'PUT', 'DELETE'].includes(request.method)) {
            console.log('CSRF Guard: Skipping CSRF check for method:', request.method);
            return true;
        }

        // Extract CSRF token from headers
        const csrfToken = this.csrfService.extractTokenFromHeaders(request.headers);

        console.log('CSRF Guard: Extracted token:', csrfToken ? csrfToken.substring(0, 20) + '...' : 'null');

        if (!csrfToken) {
            console.log('CSRF Guard: No CSRF token found');
            throw new UnauthorizedException('CSRF token is required');
        }

        // Validate the token
        const isValid = this.csrfService.validateToken(csrfToken);
        console.log('CSRF Guard: Token validation result:', isValid);

        if (!isValid) {
            throw new UnauthorizedException('Invalid CSRF token');
        }

        return true;
    }
}
