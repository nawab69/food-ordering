import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { CsrfService } from './csrf.service';
import { CsrfGuard } from './csrf.guard';

@Module({
    controllers: [AuthController],
    providers: [CsrfService, CsrfGuard],
    exports: [CsrfService, CsrfGuard],
})
export class AuthModule { }
