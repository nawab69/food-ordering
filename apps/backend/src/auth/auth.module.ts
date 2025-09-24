import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { CsrfService } from './csrf.service';

@Module({
    controllers: [AuthController],
    providers: [CsrfService],
    exports: [CsrfService],
})
export class AuthModule { }
