import { Controller, Headers, Post, Req } from '@nestjs/common';
import { StripeService } from './payment.service';
import { Request } from 'express';
import Stripe from 'stripe';
import { stripe } from 'src/config/stripe.config';
import { STRIPE_WEBHOOK_PRIVATE_SIGNING } from 'src/config/env.config';

@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('webhook')
  async handleWebhook(
    @Req() req: Request,
    @Headers('stripe-signature') signature: string,
  ) {
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        req['rawBody'],
        signature,
        STRIPE_WEBHOOK_PRIVATE_SIGNING,
      );
    } catch (error) {
      console.log(error, event);
    }
    switch (event.type) {
      case 'checkout.session.completed':
        {
          const session = event.data.object as Stripe.Checkout.Session;
          await this.stripeService.handlePaymentSuccess(session);
        }
        break;
      case 'checkout.session.expired':
        {
          const session = event.data.object as Stripe.Checkout.Session;
          await this.stripeService.handlePaymentCancel(session);
        }
        break;
      case 'payment_intent.succeeded':
        {
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          await this.stripeService.handlePaymentIntentSuccess(paymentIntent);
        }
        break;
      case 'payment_intent.payment_failed':
        {
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          await this.stripeService.handlePaymentIntentFailed(paymentIntent);
        }
        break;
      default:
        return { received: true };
    }
    return { received: true };
  }
}
