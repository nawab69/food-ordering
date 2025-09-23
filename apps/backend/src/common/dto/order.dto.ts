import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsString,
    IsNumber,
    IsArray,
    ValidateNested,
    Min,
    IsEnum,
    IsOptional
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus } from '../types';

export class CustomerDto {
    @ApiProperty({ description: 'Customer name' })
    @IsString()
    name: string;

    @ApiProperty({ description: 'Customer phone number' })
    @IsString()
    phone: string;

    @ApiPropertyOptional({ description: 'Customer address' })
    @IsOptional()
    @IsString()
    address?: string;

    @ApiPropertyOptional({ description: 'Special notes' })
    @IsOptional()
    @IsString()
    notes?: string;
}

export class OrderItemDto {
    @ApiProperty({ description: 'Menu item ID' })
    @IsString()
    id: string;

    @ApiProperty({ description: 'Quantity', minimum: 1 })
    @IsNumber()
    @Min(1)
    qty: number;
}

export class CreateOrderDto {
    @ApiProperty({ description: 'Customer information', type: CustomerDto })
    @ValidateNested()
    @Type(() => CustomerDto)
    customer: CustomerDto;

    @ApiProperty({ description: 'Order items', type: [OrderItemDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OrderItemDto)
    items: OrderItemDto[];
}

export class CreateOrderResponseDto {
    @ApiProperty({ description: 'Generated order ID' })
    orderId: string;

    @ApiProperty({ description: 'Initial order status', enum: OrderStatus })
    status: OrderStatus;

    @ApiProperty({ description: 'Estimated time in minutes' })
    etaMinutes: number;
}

export class UpdateOrderStatusDto {
    @ApiProperty({ description: 'New order status', enum: OrderStatus })
    @IsEnum(OrderStatus)
    status: OrderStatus;
}

export class OrderDto {
    @ApiProperty({ description: 'Order ID' })
    id: string;

    @ApiProperty({ description: 'Order items', type: [OrderItemDto] })
    items: OrderItemDto[];

    @ApiProperty({ description: 'Total amount in cents' })
    total: number;

    @ApiProperty({ description: 'Order status', enum: OrderStatus })
    status: OrderStatus;

    @ApiProperty({ description: 'Customer information', type: CustomerDto })
    customer: CustomerDto;

    @ApiProperty({ description: 'Creation timestamp' })
    createdAt: string;

    @ApiProperty({ description: 'Last update timestamp' })
    updatedAt: string;

    @ApiPropertyOptional({ description: 'Estimated time in minutes' })
    etaMinutes?: number;
}
