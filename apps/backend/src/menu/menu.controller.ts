import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Param,
    Body,
    Query,
    HttpStatus,
    HttpException,
    UseGuards
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiQuery,
    ApiParam,
    ApiBearerAuth
} from '@nestjs/swagger';
import { MenuService } from './menu.service';
import { MenuItemDto, MenuFiltersDto } from '../common/dto/menu.dto';
import { ThrottlerGuard } from '@nestjs/throttler';

@ApiTags('menu')
@Controller('menu')
@UseGuards(ThrottlerGuard)
export class MenuController {
    constructor(private readonly menuService: MenuService) { }

    @Get()
    @ApiOperation({ summary: 'Get all menu items with optional filters' })
    @ApiResponse({
        status: 200,
        description: 'List of menu items',
        type: [MenuItemDto]
    })
    @ApiQuery({ name: 'q', required: false, description: 'Search query' })
    @ApiQuery({ name: 'category', required: false, description: 'Filter by category' })
    @ApiQuery({ name: 'veg', required: false, description: 'Filter vegetarian items' })
    @ApiQuery({ name: 'minPrice', required: false, description: 'Minimum price filter' })
    @ApiQuery({ name: 'maxPrice', required: false, description: 'Maximum price filter' })
    async getMenuItems(@Query() filters: MenuFiltersDto) {
        try {
            const items = await this.menuService.getMenuItems(filters);
            // Convert price from cents to dollars for API response
            return items.map(item => ({
                ...item,
                price: item.price / 100
            }));
        } catch (error) {
            throw new HttpException(
                'Failed to fetch menu items',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get menu item by ID' })
    @ApiParam({ name: 'id', description: 'Menu item ID' })
    @ApiResponse({
        status: 200,
        description: 'Menu item details',
        type: MenuItemDto
    })
    @ApiResponse({ status: 404, description: 'Menu item not found' })
    async getMenuItemById(@Param('id') id: string) {
        const item = await this.menuService.getMenuItemById(id);

        if (!item) {
            throw new HttpException('Menu item not found', HttpStatus.NOT_FOUND);
        }

        // Convert price from cents to dollars for API response
        return {
            ...item,
            price: item.price / 100
        };
    }

    @Post()
    @ApiOperation({ summary: 'Create new menu item (Admin only)' })
    @ApiResponse({
        status: 201,
        description: 'Menu item created successfully',
        type: MenuItemDto
    })
    @ApiResponse({ status: 400, description: 'Invalid input data' })
    @ApiBearerAuth()
    async createMenuItem(@Body() menuItemDto: MenuItemDto) {
        try {
            // Convert price from dollars to cents for storage
            const itemData = {
                ...menuItemDto,
                price: menuItemDto.price * 100
            };

            const newItem = await this.menuService.createMenuItem(itemData);

            // Convert back to dollars for response
            return {
                ...newItem,
                price: newItem.price / 100
            };
        } catch (error) {
            throw new HttpException(
                'Failed to create menu item',
                HttpStatus.BAD_REQUEST
            );
        }
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update menu item (Admin only)' })
    @ApiParam({ name: 'id', description: 'Menu item ID' })
    @ApiResponse({
        status: 200,
        description: 'Menu item updated successfully',
        type: MenuItemDto
    })
    @ApiResponse({ status: 404, description: 'Menu item not found' })
    @ApiBearerAuth()
    async updateMenuItem(
        @Param('id') id: string,
        @Body() updates: Partial<MenuItemDto>
    ) {
        try {
            // Convert price from dollars to cents if provided
            const updateData = updates.price
                ? { ...updates, price: updates.price * 100 }
                : updates;

            const updatedItem = await this.menuService.updateMenuItem(id, updateData);

            if (!updatedItem) {
                throw new HttpException('Menu item not found', HttpStatus.NOT_FOUND);
            }

            // Convert back to dollars for response
            return {
                ...updatedItem,
                price: updatedItem.price / 100
            };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(
                'Failed to update menu item',
                HttpStatus.BAD_REQUEST
            );
        }
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete menu item (Admin only)' })
    @ApiParam({ name: 'id', description: 'Menu item ID' })
    @ApiResponse({ status: 200, description: 'Menu item deleted successfully' })
    @ApiResponse({ status: 404, description: 'Menu item not found' })
    @ApiBearerAuth()
    async deleteMenuItem(@Param('id') id: string) {
        const deleted = await this.menuService.deleteMenuItem(id);

        if (!deleted) {
            throw new HttpException('Menu item not found', HttpStatus.NOT_FOUND);
        }

        return { message: 'Menu item deleted successfully' };
    }
}
