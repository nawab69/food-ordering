import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class CsrfService {
    private readonly secret: string;

    constructor(private configService: ConfigService) {
        this.secret = this.configService.get<string>('CSRF_SECRET', 'default-csrf-secret-change-in-production');
    }

    generateToken(): string {
        const timestamp = Date.now().toString();
        const nonce = crypto.randomBytes(16).toString('hex');
        const payload = `${timestamp}:${nonce}`;
        const signature = this.createSignature(payload);

        return Buffer.from(`${payload}:${signature}`).toString('base64');
    }

    validateToken(token: string): boolean {
        try {
            const decoded = Buffer.from(token, 'base64').toString();
            const [timestamp, nonce, signature] = decoded.split(':');

            if (!timestamp || !nonce || !signature) {
                return false;
            }

            // Check if token is not too old (15 minutes)
            const tokenAge = Date.now() - parseInt(timestamp);
            if (tokenAge > 15 * 60 * 1000) {
                return false;
            }

            // Verify signature
            const payload = `${timestamp}:${nonce}`;
            const expectedSignature = this.createSignature(payload);

            return this.constantTimeCompare(signature, expectedSignature);
        } catch (error) {
            return false;
        }
    }

    private createSignature(payload: string): string {
        return crypto
            .createHmac('sha256', this.secret)
            .update(payload)
            .digest('hex');
    }

    private constantTimeCompare(a: string, b: string): boolean {
        if (a.length !== b.length) {
            return false;
        }

        let result = 0;
        for (let i = 0; i < a.length; i++) {
            result |= a.charCodeAt(i) ^ b.charCodeAt(i);
        }

        return result === 0;
    }
}
