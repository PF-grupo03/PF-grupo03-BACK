import { Controller, Post, Get, Param, Body, Delete, ParseUUIDPipe, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './orders.dto';
import { OrderEntity } from './order.entity';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}


  @ApiOperation({ summary: 'Get all orders', description: 'Get all orders' })
  @ApiResponse({ status: 200, description: 'Orders retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Orders not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @Get()
  async getOrders(@Query('page') page: string, @Query('limit') limit: string) {
    return this.ordersService.getOrders(Number(page), Number(limit));
  }

  @ApiOperation({ summary: 'Get order by ID', description: 'Get order by ID' })
  @ApiResponse({ status: 200, description: 'Order retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @Get(':id')
  async getOrderById(@Param('id') id: string): Promise<OrderEntity> {
    return this.ordersService.getOrderById(id);
  }

  @ApiOperation({ summary: 'Get orders by user ID', description: 'Get orders by user ID' })
  @ApiResponse({ status: 200, description: 'Orders retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Orders not found' })
  @ApiResponse({ status: 404, description: 'user not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @Get(':userId')
  async getOrdersByUserId(@Param('userId') userId: string): Promise<OrderEntity[]> {
    return this.ordersService.getOrdersByUserId(userId);
  }

  @ApiOperation({ summary: 'Create order', description: 'Create order' })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @Post()
  async createOrder(@Body() createOrderDto: CreateOrderDto){
    return this.ordersService.createOrder(createOrderDto);
  }

  @ApiOperation({ summary: 'Delete order by ID', description: 'Delete order by ID' })
  @ApiResponse({ status: 200, description: 'Order deleted successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @Delete(':id')
  deleteOrder(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.deleteOrder(id);
  }

}
