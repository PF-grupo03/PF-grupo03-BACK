import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { OrdersRepository } from './orders.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderEntity } from './order.entity';
import { OrderDetailsEntity } from './orderDetails.entity';
import { ProductEntity } from '../products/product.entity';
import { UserEntity } from '../users/user.entity';
@Module({
  imports: [TypeOrmModule.forFeature([OrderEntity, OrderDetailsEntity, UserEntity, ProductEntity])],
  controllers: [OrdersController],
  providers: [OrdersService, OrdersRepository],
})
export class OrdersModule {}
