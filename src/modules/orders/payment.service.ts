import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import Stripe from 'stripe';
import { OrderEntity } from './order.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderStatus } from './orderStatus.enum';
import { MailRepository } from 'src/mail/mail.repository';


@Injectable()
export class StripeService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly ordersRepository: Repository<OrderEntity>,
    private readonly mailRepository: MailRepository,
  ) {}

  async handlePaymentSuccess(session: Stripe.Checkout.Session) {
    try {
      const orderId = session.metadata?.order_id;
      if (!orderId) {
        throw new NotFoundException(
          'Order ID no encontrado en la metadata de la sesión.',
        );
      }

      const order = await this.ordersRepository.findOne({
        where: { id: orderId },
        relations: ['user'],
      });

      if (!order) {
        throw new NotFoundException('Orden no encontrada.');
      }

      const user = order.user;

      order.status = OrderStatus.COMPLETED;
      await this.ordersRepository.save(order);

      await this.mailRepository.sendOrderConfirmationEmail(order, user);

      return {
        message: 'Compra procesada correctamente',
      };
    } catch (error) {
      console.error('Error al procesar el pago:', error.message);
      throw new InternalServerErrorException('Error al procesar el pago.');
    }
  }

  async handlePaymentCancel(session: Stripe.Checkout.Session) {
    try {
      const orderId = session.metadata?.order_id;
      if (!orderId) {
        throw new NotFoundException(
          'Order ID no encontrado en la metadata de la sesión.',
        );
      }

      const order = await this.ordersRepository.findOne({
        where: { id: orderId },
        relations: ['user'],
      });

      if (!order) {
        throw new NotFoundException('Orden no encontrada.');
      }

      order.status = OrderStatus.CANCELED;
      await this.ordersRepository.save(order);

    } catch (error) {
      console.error('Error al procesar el pago:', error.message);
      throw new InternalServerErrorException('Error al procesar el pago.');
    }
  }

  async handlePaymentIntentSuccess(paymentIntent: Stripe.PaymentIntent) {
    const orderId = paymentIntent.metadata?.order_id;
    if (!orderId) {
      throw new NotFoundException('Order ID no encontrado en metadata del PaymentIntent.');
    }

    const order = await this.ordersRepository.findOne({ where: { id: orderId }, relations: ['user'] });

    if (!order) {
      throw new NotFoundException('Orden no encontrada.');
    }

    order.status = OrderStatus.COMPLETED;
    await this.ordersRepository.save(order);

    await this.mailRepository.sendOrderConfirmationEmail(order, order.user);

    return { message: 'Pago procesado correctamente.' };
  }

  async handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
    const orderId = paymentIntent.metadata?.order_id;
    if (!orderId) {
      throw new NotFoundException('Order ID no encontrado en metadata del PaymentIntent.');
    }

    const order = await this.ordersRepository.findOne({ where: { id: orderId }, relations: ['user'] });

    if (!order) {
      throw new NotFoundException('Orden no encontrada.');
    }

    order.status = OrderStatus.CANCELED;
    await this.ordersRepository.save(order);

    return { message: 'El intento de pago falló y la orden fue cancelada.' };
  }
}
