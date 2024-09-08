import { Controller, Post, Get, Param, Body, Delete, ParseUUIDPipe, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './orders.dto';
import { OrderEntity } from './order.entity';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  async getOrders(@Query('page') page: string, @Query('limit') limit: string) {
    return this.ordersService.getOrders(Number(page), Number(limit));
  }

  @Post()
  async createOrder(@Body() createOrderDto: CreateOrderDto){
    return this.ordersService.createOrder(createOrderDto);
  }

  @Get(':id')
  async getOrderById(@Param('id') id: string): Promise<OrderEntity> {
    return this.ordersService.getOrderById(id);
  }

  @Get(':userId')
  async getOrdersByUserId(@Param('userId') userId: string): Promise<OrderEntity[]> {
    return this.ordersService.getOrdersByUserId(userId);
  }

  @Delete(':id')
  deleteOrder(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.deleteOrder(id);
  }

}
