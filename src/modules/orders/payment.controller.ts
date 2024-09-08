import { Controller, Headers, Post, RawBody, Req, UsePipes } from '@nestjs/common';
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
        req["rawBody"],
        signature,
        STRIPE_WEBHOOK_PRIVATE_SIGNING,
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
