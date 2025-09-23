import {
    Controller,
    Get,
    Post,
    Put,
    Param,
    Body,
    HttpStatus,
    HttpException,
    UseGuards,
    UseInterceptors
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiSecurity
} from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { OrdersService } from './orders.service';
import { PushService } from '../push/push.service';
import {
    CreateOrderDto,
    CreateOrderResponseDto,
    UpdateOrderStatusDto,
    OrderDto
} from '../common/dto/order.dto';
import { CsrfGuard } from '../auth/csrf.guard';

@ApiTags('orders')
@Controller('orders')
@UseGuards(ThrottlerGuard)
export class OrdersController {
    constructor(
        private readonly ordersService: OrdersService,
        private readonly pushService: PushService,
    ) { }

    @Post()
    @UseGuards(CsrfGuard)
    @ApiOperation({ summary: 'Create a new order' })
    @ApiSecurity('csrf-token')
    @ApiResponse({
        status: 201,
        description: 'Order created successfully',
        type: CreateOrderResponseDto
    })
    @ApiResponse({ status: 400, description: 'Invalid order data' })
    @ApiResponse({ status: 403, description: 'CSRF token required' })
    async createOrder(@Body() createOrderDto: CreateOrderDto): Promise<CreateOrderResponseDto> {
        try {
            const result = await this.ordersService.createOrder(createOrderDto);

            // Send push notification for new order (to restaurant/admin)
            await this.pushService.notifyNewOrder(result.orderId);

            return result;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(
                'Failed to create order',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get order by ID' })
    @ApiParam({ name: 'id', description: 'Order ID' })
    @ApiResponse({
        status: 200,
        description: 'Order details',
        type: OrderDto
    })
    @ApiResponse({ status: 404, description: 'Order not found' })
    async getOrderById(@Param('id') id: string): Promise<OrderDto> {
        const order = await this.ordersService.getOrderById(id);

        if (!order) {
            throw new HttpException('Order not found', HttpStatus.NOT_FOUND);
        }

        // Convert price from cents to dollars for API response
        return {
            ...order,
            total: order.total / 100
        };
    }

    @Put(':id/status')
    @UseGuards(CsrfGuard)
    @ApiOperation({ summary: 'Update order status (Admin/Mock only)' })
    @ApiParam({ name: 'id', description: 'Order ID' })
    @ApiSecurity('csrf-token')
    @ApiResponse({
        status: 200,
        description: 'Order status updated successfully',
        type: OrderDto
    })
    @ApiResponse({ status: 404, description: 'Order not found' })
    @ApiResponse({ status: 400, description: 'Invalid status transition' })
    @ApiResponse({ status: 403, description: 'CSRF token required' })
    async updateOrderStatus(
        @Param('id') id: string,
        @Body() updateStatusDto: UpdateOrderStatusDto,
    ): Promise<OrderDto> {
        try {
            const updatedOrder = await this.ordersService.updateOrderStatus(
                id,
                updateStatusDto.status
            );

            if (!updatedOrder) {
                throw new HttpException('Order not found', HttpStatus.NOT_FOUND);
            }

            // Send push notification for status update
            await this.pushService.notifyOrderStatusUpdate(id, updateStatusDto.status);

            // Convert price from cents to dollars for API response
            return {
                ...updatedOrder,
                total: updatedOrder.total / 100
            };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(
                'Failed to update order status',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Get()
    @ApiOperation({ summary: 'Get all orders (Admin only)' })
    @ApiResponse({
        status: 200,
        description: 'List of all orders',
        type: [OrderDto]
    })
    async getOrders(): Promise<OrderDto[]> {
        try {
            const orders = await this.ordersService.getOrders();

            // Convert prices from cents to dollars for API response
            return orders.map(order => ({
                ...order,
                total: order.total / 100
            }));
        } catch (error) {
            throw new HttpException(
                'Failed to fetch orders',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}
