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