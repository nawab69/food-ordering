import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class CsrfService {
    private readonly secret: string;

    constructor(private readonly configService: ConfigService) {
        this.secret = this.configService.get<string>('CSRF_SECRET', 'default-csrf-secret-change-in-production');
    }

    /**
     * Generate a CSRF token
     */
    generateToken(): string {
        const randomBytes = crypto.randomBytes(32).toString('hex');
        const timestamp = Date.now().toString();
        const data = `${randomBytes}:${timestamp}`;

        const hmac = crypto.createHmac('sha256', this.secret);
        hmac.update(data);
        const signature = hmac.digest('hex');

        const token = `${data}:${signature}`;
        console.log('CSRF: Generated token parts:', { randomBytes: randomBytes.substring(0, 10) + '...', timestamp, signature: signature.substring(0, 10) + '...' });
        console.log('CSRF: Full token before base64:', token.substring(0, 50) + '...');

        return Buffer.from(token).toString('base64');
    }

    /**
     * Validate a CSRF token
     */
    validateToken(token: string): boolean {
        try {
            console.log('CSRF: Validating token:', token.substring(0, 20) + '...');

            const decoded = Buffer.from(token, 'base64').toString('utf-8');
            console.log('CSRF: Decoded token:', decoded.substring(0, 50) + '...');

            const parts = decoded.split(':');
            console.log('CSRF: Token parts count:', parts.length);
            console.log('CSRF: Token parts:', parts.map((part, i) => `${i}: ${part.substring(0, 20)}...`));

            if (parts.length !== 3) {
                console.log('CSRF: Invalid token format - expected 3 parts, got', parts.length);
                return false;
            }

            const [randomBytes, timestamp, signature] = parts;

            if (!randomBytes || !timestamp || !signature) {
                console.log('CSRF: Missing parts');
                return false;
            }

            const data = `${randomBytes}:${timestamp}`;
            const hmac = crypto.createHmac('sha256', this.secret);
            hmac.update(data);
            const expectedSignature = hmac.digest('hex');

            console.log('CSRF: Data for signature:', data.substring(0, 50) + '...');
            console.log('CSRF: Expected signature:', expectedSignature.substring(0, 20) + '...');
            console.log('CSRF: Received signature:', signature.substring(0, 20) + '...');

            // Verify signature
            if (signature !== expectedSignature) {
                console.log('CSRF: Signature mismatch');
                return false;
            }

            // Check if token is not too old (24 hours)
            const tokenAge = Date.now() - parseInt(timestamp);
            const maxAge = 24 * 60 * 60 * 1000; // 24 hours

            console.log('CSRF: Token age:', tokenAge, 'ms, Max age:', maxAge, 'ms');

            const isValid = tokenAge <= maxAge;
            console.log('CSRF: Token validation result:', isValid);
            return isValid;
        } catch (error) {
            console.log('CSRF: Validation error:', error);
            return false;
        }
    }

    /**
     * Extract token from request headers
     */
    extractTokenFromHeaders(headers: Record<string, string | string[] | undefined>): string | null {
        const csrfToken = headers['x-csrf-token'];
        if (typeof csrfToken === 'string') {
            return csrfToken;
        }
        if (Array.isArray(csrfToken) && csrfToken.length > 0) {
            return csrfToken[0];
        }
        return null;
    }
}
