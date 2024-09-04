/* import {
  BadRequestException,
  Controller,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderEntity } from './order.entity';
import { Request, Response } from 'express';
import { stripe } from 'src/config/stripe.config';
import { OrderStatus } from './orderStatus.enum';

@Controller()
export class PaymentsController {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly ordersRepository: Repository<OrderEntity>,
  ) {}

  @Post('payment-success')
  async handleSuccess(@Req() req: Request, @Res() res: Response) {
    const sessionId = req.body.session_id;
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    const orderId = session.metadata.order_id;

    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
    });

    if (!order) {
      throw new BadRequestException(`Orden con ID ${orderId} no encontrada.`);
    }

    order.status = OrderStatus.COMPLETED;
    await this.ordersRepository.save(order);

    const orderConStock = await this.ordersRepository.findOne({
            where: { id: order.id },
            relations: {
                orderDetails: {
                    product: true,
                },
            },
        });

        const sanitizedOrder = {
            ...orderConStock,
            orderDetails: {
                ...orderConStock.orderDetails,
                products: orderConStock.orderDetails.product.map(({ stock, ...productWithoutStock }) => productWithoutStock)
            }
        };

    res.json({
      message: 'Orden completada',
      sanitizedOrder,
    });
  }

  @Post('payment-cancel')
  async handleCancel(@Req() req: Request, @Res() res: Response) {
    const sessionId = req.body.session_id;
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    const orderId = session.metadata.order_id;
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
    });

    if (!order) {
      throw new BadRequestException(`Orden con ID ${orderId} no encontrada.`);
    }

    order.status = OrderStatus.CANCELED;
    await this.ordersRepository.save(order);

    const orderConStock = await this.ordersRepository.findOne({
        where: { id: order.id },
        relations: {
            orderDetails: {
                product: true,
            },
        },
    });

    const sanitizedOrder = {
        ...orderConStock,
        orderDetails: {
            ...orderConStock.orderDetails,
            products: orderConStock.orderDetails.product.map(({ stock, ...productWithoutStock }) => productWithoutStock)
        }
    };

    res.json({
      message: 'Orden cancelada',
      sanitizedOrder,
    });
  }
}
 */