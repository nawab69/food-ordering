import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsObject, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class PushKeysDto {
    @ApiProperty({ description: 'P256DH key for push encryption' })
    @IsString()
    p256dh: string;

    @ApiProperty({ description: 'Auth key for push encryption' })
    @IsString()
    auth: string;
}

export class PushSubscriptionDto {
    @ApiProperty({ description: 'Push endpoint URL' })
    @IsString()
    endpoint: string;

    @ApiProperty({ description: 'Push keys', type: PushKeysDto })
    @IsObject()
    @ValidateNested()
    @Type(() => PushKeysDto)
    keys: PushKeysDto;

    @ApiPropertyOptional({ description: 'User hint for identification' })
    @IsOptional()
    @IsString()
    userHint?: string;

    @ApiPropertyOptional({ description: 'Associated order ID' })
    @IsOptional()
    @IsString()
    orderIdHint?: string;
}

export class PushPublicKeyDto {
    @ApiProperty({ description: 'VAPID public key' })
    publicKey: string;
}
