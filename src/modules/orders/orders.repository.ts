  import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from "@nestjs/common";
import { InjectEntityManager, InjectRepository } from "@nestjs/typeorm";
import { EntityManager, Repository } from "typeorm";
import { CreateOrderDto } from "./orders.dto";
import { ProductEntity } from "../products/product.entity";
import { UserEntity } from "../users/user.entity";
import { OrderEntity } from "./order.entity";
import { OrderDetailsEntity } from "./orderDetails.entity";
// import { stripe } from "src/config/stripe.config";

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

                // const session = await stripe.checkout.sessions.create({
                //     payment_method_types: ['card'],
                //     line_items: productsArray.map(product => ({
                //         price_data: {
                //             currency: 'usd',
                //             product_data: {
                //                 name: product.title,
                //             },
                //             unit_amount: Math.round(product.price * 100),
                //         },
                //         quantity: 1,
                //     })),
                //     mode: "payment",
                //     success_url: '',
                //     cancel_url: '',
                // }) inicio pasarela de pagos

                const orderDetail = new OrderDetailsEntity();
                orderDetail.price = Number(finalTotal.toFixed(2));
                orderDetail.product = productsArray;
                orderDetail.order = newOrder;
                await transactionalEntityManager.getRepository(OrderDetailsEntity).save(orderDetail);

                newOrder.orderDetails = orderDetail;
                await transactionalEntityManager.getRepository(OrderEntity).save(newOrder);

            } catch (error) {
                if (error instanceof BadRequestException) {
                    throw error;
                }
                throw new InternalServerErrorException('Error al procesar la orden: ' + error.message);
            }

        });

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
        return sanitizedOrder;
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