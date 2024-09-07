// import {
//   BadRequestException,
//   Controller,
//   Post,
//   Req,
//   Res,
// } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { OrderEntity } from './order.entity';
// import { Request, Response } from 'express';
// import { stripe } from 'src/config/stripe.config';
// import { OrderStatus } from './orderStatus.enum';

import { Controller, Headers, Post, Req, Res } from '@nestjs/common';
import { StripeService } from './payment.service';
import { Request, Response } from 'express';
import Stripe from 'stripe';
import { stripe } from 'src/config/stripe.config';

// @Controller()
// export class PaymentsController {
//   constructor(
//     @InjectRepository(OrderEntity)
//     private readonly ordersRepository: Repository<OrderEntity>,
//   ) {}

//   @Post('payment-success')
//   async handleSuccess(@Req() req: Request, @Res() res: Response) {

//     const order = await this.ordersRepository.findOne({
//       where: { id: orderId },
//     });

//     if (!order) {
//       throw new BadRequestException(`Orden con ID ${orderId} no encontrada.`);
//     }

//     order.status = OrderStatus.COMPLETED;
//     await this.ordersRepository.save(order);

//     const orderConStock = await this.ordersRepository.findOne({
//             where: { id: order.id },
//             relations: {
//                 orderDetails: {
//                     product: true,
//                 },
//             },
//         });

//         const sanitizedOrder = {
//           ...orderConStock,
//           orderDetails: {
//             ...orderConStock.orderDetails,
//             products: orderConStock.orderDetails.map(({ product, ...orderDetailWithoutProduct }) => ({
//               ...orderDetailWithoutProduct,
//               product: {
//                 ...product,
//                 stock: undefined,
//               },
//             })),
//           },
//         };

//     res.json({
//       message: 'Orden completada',
//       sanitizedOrder,
//     });
//   }

//   @Post('payment-cancel')
//   async handleCancel(@Req() req: Request, @Res() res: Response) {
//     const sessionId = req.body.session_id;
//     const session = await stripe.checkout.sessions.retrieve(sessionId);

//     const orderId = session.metadata.order_id;
//     const order = await this.ordersRepository.findOne({
//       where: { id: orderId },
//     });

//     if (!order) {
//       throw new BadRequestException(`Orden con ID ${orderId} no encontrada.`);
//     }

//     order.status = OrderStatus.CANCELED;
//     await this.ordersRepository.save(order);

//     const orderConStock = await this.ordersRepository.findOne({
//         where: { id: order.id },
//         relations: {
//             orderDetails: {
//                 product: true,
//             },
//         },
//     });

//     const sanitizedOrder = {
//       ...orderConStock,
//       orderDetails: {
//         ...orderConStock.orderDetails,
//         products: orderConStock.orderDetails.map(({ product, ...orderDetailWithoutProduct }) => ({
//           ...orderDetailWithoutProduct,
//           product: {
//             ...product,
//             stock: undefined,
//           },
//         })),
//       },
//     };

//     res.json({
//       message: 'Orden cancelada',
//       sanitizedOrder,
//     });
//   }
// }

@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('webhook')
  async handleWebhook(
    @Req() req: Request,
    @Res() res: Response,
    @Headers('stripe-signature') signature: string,
  ) {
    const endpointSecret = 'clidev_1Pw6MRRsgw4cKaffDtYY7NY6';
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        req['rawBody'],
        signature,
        endpointSecret,
      );
    } catch (error) {
      console.log(error);
    }
    switch (event.type) {
      case 'checkout.session.completed':
        {
          const session = event.data.object as Stripe.Checkout.Session;
          await this.stripeService.handlePaymentSuccess(session);
        }
        return { received: true };
    }
  }
}
