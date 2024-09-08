import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderEntity } from './order.entity';
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

  async createOrder(createOrderDto: CreateOrderDto) {
    return await this.orderRepository.addOrder(createOrderDto);
  }

  async getOrderById(id: string): Promise<OrderEntity> {
    const order = await this.orderRepository.getOrder(id);
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return order;
  }

  async getOrdersByUserId(userId: string): Promise<OrderEntity[]> {
    const orders = await this.orderRepository.getOrdersByUserId(userId);
    if(!orders || orders.length === 0) {
      throw new NotFoundException(`No hay ordenes registrada para el usuario de ID ${userId}`);
    }
    return orders;
  }
}

