import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { OrderEntity } from './order.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class StripeService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly ordersRepository: Repository<OrderEntity>,
  ) {}

  async handlePaymentSuccess(session: Stripe.Checkout.Session) {
    // const orderId = session.metadata?.order_id;
    console.log(session)

  }
}
