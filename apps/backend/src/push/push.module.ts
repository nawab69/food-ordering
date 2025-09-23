import { Module } from '@nestjs/common';
import { PushController } from './push.controller';
import { PushService } from './push.service';
import { DatabaseService } from '../database/database.service';

@Module({
    controllers: [PushController],
    providers: [PushService, DatabaseService],
    exports: [PushService],
})
export class PushModule { }
