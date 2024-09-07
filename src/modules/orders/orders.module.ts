import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { ProductEntity } from '../products/product.entity';
import { OrderEntity } from './order.entity';
import { UserEntity } from '../users/user.entity';
import { OrdersRepository } from './orders.repository';
import { OrderDetailsEntity } from './orderDetails.entity';
import { StripeService } from './payment.service';
import { StripeController } from './payment.controller';
import { PassengerEntity } from './passenger.entity';



@Module({
  imports: [
    TypeOrmModule.forFeature([OrderEntity, OrderDetailsEntity, ProductEntity, UserEntity, PassengerEntity]),
  ],
  controllers: [OrdersController, StripeController],
  providers: [OrdersService, OrdersRepository, StripeService],
  exports: [OrdersService],
})
export class OrdersModule {}
