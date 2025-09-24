import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { MenuModule } from './menu/menu.module';
import { OrdersModule } from './orders/orders.module';
import { PushModule } from './push/push.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { DatabaseService } from './database/database.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000, // 1 second
        limit: 3000,
      },
      {
        name: 'medium',
        ttl: 10000, // 10 seconds
        limit: 2000,
      },
      {
        name: 'long',
        ttl: 60000, // 1 minute
        limit: 10000,
      },
    ]),
    MenuModule,
    OrdersModule,
    PushModule,
    HealthModule,
    AuthModule,
  ],
  providers: [
    DatabaseService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule { }
