/* import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { OrdersRepository } from './orders.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderEntity } from './order.entity';
import { OrderDetailsEntity } from './orderDetails.entity';
import { ProductEntity } from '../products/product.entity';
import { UserEntity } from '../users/user.entity';
import { PaymentsController } from './payment.controller';
@Module({
  imports: [TypeOrmModule.forFeature([OrderEntity, OrderDetailsEntity, UserEntity, ProductEntity])],
  controllers: [OrdersController, PaymentsController],
  providers: [OrdersService, OrdersRepository],
})
export class OrdersModule {}
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { ProductEntity } from '../products/product.entity';
import { OrderEntity } from './order.entity';
import { UserEntity } from '../users/user.entity';
import { OrdersRepository } from './orders.repository';
import { OrderDetailsEntity } from './orderDetails.entity';



@Module({
  imports: [
    TypeOrmModule.forFeature([OrderEntity, OrderDetailsEntity, ProductEntity, UserEntity]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService, OrdersRepository],
  exports: [OrdersService],
})
export class OrdersModule {}
