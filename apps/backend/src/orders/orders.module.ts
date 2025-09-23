import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { DatabaseService } from '../database/database.service';
import { MenuModule } from '../menu/menu.module';
import { PushModule } from '../push/push.module';

@Module({
    imports: [MenuModule, PushModule],
    controllers: [OrdersController],
    providers: [OrdersService, DatabaseService],
    exports: [OrdersService],
})
export class OrdersModule { }
