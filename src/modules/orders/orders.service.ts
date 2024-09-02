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
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrdersRepository } from './orders.repository';
import { CreateOrderDto, OrderResponseDto } from './orders.dto';


@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(OrdersRepository)
    private readonly ordersRepo: OrdersRepository,
  ) {}

  async createOrder(dto: CreateOrderDto): Promise<OrderResponseDto> {
    return await this.ordersRepo.createOrder(dto);
  }
}

