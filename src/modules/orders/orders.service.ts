/* import { Injectable } from '@nestjs/common';
import { OrdersRepository } from './orders.repository';
import { CreateOrderDto } from './orders.dto';

@Injectable()
export class OrdersService {
    constructor(private readonly ordersRepository: OrdersRepository){}

    addOrder(userId: string, products: CreateOrderDto['products']) {
        return this.ordersRepository.addOrder(userId, products);
    }


    getOrder(id: string) {
        return this.ordersRepository.getOrder(id);
    }
}
 */

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderEntity } from './order.entity';
import { OrderDetailsEntity } from './orderDetails.entity';
import { UserEntity } from '../users/user.entity';
import { ProductEntity } from '../products/product.entity';
import { CreateOrderDto } from './orders.dto';
import { OrdersRepository } from './orders.repository';


@Injectable()
export class OrdersService {
  constructor(
    private readonly orderRepository: OrdersRepository,
    @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(ProductEntity) private readonly productRepository: Repository<ProductEntity>,
  ) {}

  async createOrder(createOrderDto: CreateOrderDto): Promise<OrderEntity> {
    return this.orderRepository.addOrder(createOrderDto);
  }

  async getOrderById(id: string): Promise<OrderEntity> {
    const order = await this.orderRepository.getOrder(id);
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return order;
  }
}

