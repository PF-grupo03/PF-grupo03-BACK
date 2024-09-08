import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './orders.dto';
import { OrderEntity } from './order.entity';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async createOrder(@Body() createOrderDto: CreateOrderDto){
    return this.ordersService.createOrder(createOrderDto);
  }

  @Get(':id')
  async getOrderById(@Param('id') id: string): Promise<OrderEntity> {
    return this.ordersService.getOrderById(id);
  }

  @Get('useer/:userId')
  async getOrdersByUserId(@Param('userId') userId: string): Promise<OrderEntity[]> {
    return this.ordersService.getOrdersByUserId(userId);
  }


}
