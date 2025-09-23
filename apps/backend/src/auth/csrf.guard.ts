import {
    Injectable,
    CanActivate,
    ExecutionContext,
    HttpException,
    HttpStatus
} from '@nestjs/common';
import { Request } from 'express';
import { CsrfService } from './csrf.service';

@Injectable()
export class CsrfGuard implements CanActivate {
    constructor(private readonly csrfService: CsrfService) { }

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest<Request>();

        // Get token from header
        const headerToken = request.headers['x-csrf-token'] as string;

        // Get token from cookie
        const cookieToken = request.cookies?.csrf;

        if (!headerToken || !cookieToken) {
            throw new HttpException(
                'CSRF token required',
                HttpStatus.FORBIDDEN
            );
        }

        // Tokens must match
        if (headerToken !== cookieToken) {
            throw new HttpException(
                'CSRF token mismatch',
                HttpStatus.FORBIDDEN
            );
        }

        // Validate token
        if (!this.csrfService.validateToken(headerToken)) {
            throw new HttpException(
                'Invalid CSRF token',
                HttpStatus.FORBIDDEN
            );
        }

        return true;
    }
}
