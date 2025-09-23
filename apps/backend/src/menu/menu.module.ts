import { Module } from '@nestjs/common';
import { MenuController } from './menu.controller';
import { MenuService } from './menu.service';
import { DatabaseService } from '../database/database.service';

@Module({
    controllers: [MenuController],
    providers: [MenuService, DatabaseService],
    exports: [MenuService],
})
export class MenuModule { }
