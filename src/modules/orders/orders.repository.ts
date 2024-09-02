/* import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from "@nestjs/common";
import { InjectEntityManager, InjectRepository } from "@nestjs/typeorm";
import { EntityManager, Repository } from "typeorm";
import { CreateOrderDto } from "./orders.dto";
import { ProductEntity } from "../products/product.entity";
import { UserEntity } from "../users/user.entity";
import { OrderEntity } from "./order.entity";
import { OrderDetailsEntity } from "./orderDetails.entity";
import { stripe } from "src/config/stripe.config";

@Injectable()
export class OrdersRepository {
    constructor(
        @InjectEntityManager()
        private entityManager: EntityManager,
        @InjectRepository(OrderEntity)
        private ordersRepository: Repository<OrderEntity>,
    ) {}

    async addOrder(userId: string, products: CreateOrderDto['products']) {
        let total = 0;
        let order: OrderEntity;
        const productsArray: ProductEntity[] = [];
        const productIdsInOrder = new Set<string>();

        for (const element of products) {
            if (productIdsInOrder.has(element.id)) {
                throw new BadRequestException(`No se pueden comprar dos productos iguales: Producto con id ${element.id} repetido`);
            }
            productIdsInOrder.add(element.id);
        }

        await this.entityManager.transaction(async (transactionalEntityManager) => {

            const user = await transactionalEntityManager.getRepository(UserEntity).findOne({ where: { id: userId } });
            if (!user) {
                throw new NotFoundException(`Usuario con id ${userId} no encontrado`);
            }

            order = new OrderEntity();
            order.date = new Date();
            order.user = user;
            const newOrder = await transactionalEntityManager.getRepository(OrderEntity).save(order);

            try {

                for (const element of products) {
                    const product = await transactionalEntityManager.getRepository(ProductEntity).findOne({ where: { id: element.id } });
                    if (!product) {
                        throw new BadRequestException(`Producto con id ${element.id} no encontrado`);
                    }
                    if (product.stock <= 0) {
                        throw new BadRequestException(`Producto con id ${element.id} no disponible en stock`);
                    }

                    total += Number(product.price);
                    product.stock -= 1;
                    productsArray.push(product);
                    await transactionalEntityManager.getRepository(ProductEntity).save(product);
                }

                let finalTotal = total;
                if (total > 200) {
                    finalTotal = (total - 200) * 1.13 + 200;
                }

                const orderDetail = new OrderDetailsEntity();
                orderDetail.price = Number(finalTotal.toFixed(2));
                orderDetail.product = productsArray;
                orderDetail.order = newOrder;
                await transactionalEntityManager.getRepository(OrderDetailsEntity).save(orderDetail);

                newOrder.orderDetails = orderDetail;
                await transactionalEntityManager.getRepository(OrderEntity).save(newOrder);

                const successUrl = 'https://pf-grupo03-back.onrender.com/payment-success';
                const cancelUrl = 'https://pf-grupo03-back.onrender.com/payment-cancel';

                const session = await stripe.checkout.sessions.create({
                    payment_method_types: ['card'],
                    line_items: productsArray.map(product => ({
                        price_data: {
                            currency: 'usd',
                            product_data: {
                                name: product.title,
                            },
                            unit_amount: Math.round(product.price * 100),
                        },
                        quantity: 1,
                    })),
                    mode: "payment",
                    success_url: successUrl,
                    cancel_url: cancelUrl,
                })

                newOrder.stripeSessionId = session.id;
                await transactionalEntityManager.getRepository(OrderEntity).save(newOrder)

                return { sessionId: session.id };

            } catch (error) {
                if (error instanceof BadRequestException) {
                    throw error;
                }
                throw new InternalServerErrorException('Error al procesar la orden: ' + error.message);
            }

        });
    }

    async getOrder(id: string) {
        const order = await this.ordersRepository.findOne({
            where: { id },
            relations: {
                orderDetails: {
                    product: true,
                },
            },
        });

        if (!order) {
            throw new NotFoundException(`Orden con id ${id} no encontrada`);
        }

        const sanitizedOrder = {
            ...order,
            orderDetails: {
                ...order.orderDetails,
                products: order.orderDetails.product.map(({ stock, ...productWithoutStock }) => productWithoutStock)
            }
        };
        return sanitizedOrder;
    }
}

 */

import { Repository, EntityRepository } from 'typeorm';
import { OrderEntity } from './order.entity';
import { ProductEntity } from '../products/product.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { OrderDetailsEntity } from './orderDetails.entity';
import { CreateOrderDto, OrderResponseDto } from './orders.dto';

export class OrdersRepository extends Repository<OrderEntity> {
  async createOrder(dto: CreateOrderDto): Promise<OrderResponseDto> {
    const { userId, products } = dto;

    // Start transaction
    return await this.manager.transaction(async (transactionalEntityManager) => {
      // Calculate total
      let total = 0;
      const details = [];

      for (const productDto of products) {
        const product = await transactionalEntityManager.findOne(ProductEntity, {
          where: { id: productDto.id }
        });

        if (!product) {
          throw new NotFoundException(`Product with ID ${productDto.id} not found`);
        }

        if (product.stock < (productDto.adults + (productDto.minors || 0))) {
          throw new BadRequestException(`Not enough stock for product ${productDto.id}`);
        }

        const totalAdults = productDto.adults * product.price;
        const totalMinors = (productDto.minors || 0) * (product.price * 0.5);
        total += totalAdults + totalMinors;

        for (let i = 0; i < productDto.adults; i++) {
          details.push({
            order: new OrderEntity(), // Placeholder
            product,
            quantity: 1,
            price: product.price,
            isAdult: true,
          });
        }

        for (let i = 0; i < (productDto.minors || 0); i++) {
          details.push({
            order: new OrderEntity(), // Placeholder
            product,
            quantity: 1,
            price: product.price * 0.5,
            isAdult: false,
          });
        }

        // Update stock
        product.stock -= (productDto.adults + (productDto.minors || 0));
        await transactionalEntityManager.save(product);
      }

      // Apply tax
      if (total > 200) {
        total = 200 + (total - 200) * 1.13;
      }

      // Create order
      const order = transactionalEntityManager.create(OrderEntity, {
        total,
        passengerName: 'Placeholder Name', // You may want to include these fields in the DTO
        passengerSurname: 'Placeholder Surname',
        passengerDni: 'Placeholder DNI',
      });

      await transactionalEntityManager.save(order);

      // Assign order to details
      details.forEach(detail => {
        detail.order = order;
      });

      await transactionalEntityManager.save(OrderDetailsEntity, details);

      // Prepare response
      return {
        id: order.id,
        total,
        passengerName: order.passengerName,
        passengerSurname: order.passengerSurname,
        passengerDni: order.passengerDni,
        details: details.map(detail => ({
          productId: detail.product.id,
          quantity: detail.quantity,
          price: detail.price,
          isAdult: detail.isAdult,
        })),
      };
    });
  }
}

