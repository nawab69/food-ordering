import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsBoolean, IsOptional, IsArray, Min } from 'class-validator';

export class MenuItemDto {
    @ApiProperty({ description: 'Unique identifier for the menu item' })
    @IsString()
    id: string;

    @ApiProperty({ description: 'Name of the menu item' })
    @IsString()
    name: string;

    @ApiProperty({ description: 'Price in cents', minimum: 0 })
    @IsNumber()
    @Min(0)
    price: number;

    @ApiProperty({ description: 'Category of the menu item' })
    @IsString()
    category: string;

    @ApiPropertyOptional({ description: 'Tags for the menu item', type: [String] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];

    @ApiPropertyOptional({ description: 'Image URL for the menu item' })
    @IsOptional()
    @IsString()
    imageUrl?: string;

    @ApiProperty({ description: 'Whether the item is available' })
    @IsBoolean()
    available: boolean;

    @ApiPropertyOptional({ description: 'Description of the menu item' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({ description: 'Rating of the menu item', minimum: 0, maximum: 5 })
    @IsOptional()
    @IsNumber()
    @Min(0)
    rating?: number;

    @ApiPropertyOptional({ description: 'Estimated preparation time' })
    @IsOptional()
    @IsString()
    estimatedTime?: string;
}

export class MenuFiltersDto {
    @ApiPropertyOptional({ description: 'Search query' })
    @IsOptional()
    @IsString()
    q?: string;

    @ApiPropertyOptional({ description: 'Filter by category' })
    @IsOptional()
    @IsString()
    category?: string;

    @ApiPropertyOptional({ description: 'Filter vegetarian items' })
    @IsOptional()
    @IsBoolean()
    veg?: boolean;

    @ApiPropertyOptional({ description: 'Minimum price filter' })
    @IsOptional()
    @IsNumber()
    @Min(0)
    minPrice?: number;

    @ApiPropertyOptional({ description: 'Maximum price filter' })
    @IsOptional()
    @IsNumber()
    @Min(0)
    maxPrice?: number;
}
