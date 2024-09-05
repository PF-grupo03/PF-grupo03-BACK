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

// 

// import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
// import { InjectEntityManager, InjectRepository } from "@nestjs/typeorm";
// import { EntityManager, Repository } from "typeorm";
// import { OrderEntity } from "./order.entity";
// import { OrderDetailsEntity } from "./orderDetails.entity";
// import { UserEntity } from "../users/user.entity";
// import { ProductEntity } from "../products/product.entity";
// import { CreateOrderDto } from "./orders.dto";
// import { stripe } from "../../config/stripe.config";

// @Injectable()
// export class OrdersRepository {
//   constructor(
//     @InjectEntityManager() private entityManager: EntityManager,
//     @InjectRepository(OrderEntity) private ordersRepository: Repository<OrderEntity>,
//     @InjectRepository(OrderDetailsEntity) private orderDetailsRepository: Repository<OrderDetailsEntity>,
//     @InjectRepository(UserEntity) private usersRepository: Repository<UserEntity>,
//     @InjectRepository(ProductEntity) private productsRepository: Repository<ProductEntity>,
//   ) {}

// //   async addOrder(createOrderDto: CreateOrderDto) {
// //     const { userId, products, adults = 0, children = 0 } = createOrderDto;
// //     let total = 0;

    
// //     return await this.entityManager.transaction(async (transactionalEntityManager) => {
      
// //       const user = await transactionalEntityManager.findOne(UserEntity, { where: { id: userId } });
// //       if (!user) {
// //         throw new NotFoundException(`Usuario con id ${userId} no encontrado`);
// //       }

     
// //       const totalQuantity = adults + children * 0.5;

// //       const productsArray: OrderDetailsEntity[] = [];

// //       for (const productDto of products) {
       
// //         const product = await transactionalEntityManager.findOne(ProductEntity, { where: { id: productDto.id } });
// //         if (!product) {
// //           throw new BadRequestException(`Producto con id ${productDto.id} no encontrado`);
// //         }

        
// //         if (product.stock < totalQuantity) {
// //           throw new BadRequestException(`Stock insuficiente para el producto con id ${productDto.id}`);
// //         }

       
// //         const productTotal = product.price * totalQuantity;
// //         total += productTotal;

        
// //         product.stock -= totalQuantity;
// //         await transactionalEntityManager.save(ProductEntity, product);

        
// //         const orderDetail = new OrderDetailsEntity();
// //         orderDetail.product = product;
// //         orderDetail.quantity = totalQuantity;
// //         orderDetail.price = productTotal;
// //         productsArray.push(orderDetail);
// //       }

      
// //       if (total > 200) {
// //         total += (total - 200) * 0.13;
// //       }

      
// //       const order = new OrderEntity();
// //       order.orderDate = new Date();
// //       order.totalPrice = total;
// //       order.user = user;

// //       const newOrder = await transactionalEntityManager.save(OrderEntity, order);

      
// //       for (const orderDetail of productsArray) {
// //         orderDetail.order = newOrder;
// //         await transactionalEntityManager.save(OrderDetailsEntity, orderDetail);
// //       }
// async addOrder(createOrderDto: CreateOrderDto) {
//     const { userId, products, adults = 0, children = 0 } = createOrderDto;
//     let total = 0;

//     return await this.entityManager.transaction(async (transactionalEntityManager) => {
      
//       const user = await transactionalEntityManager.findOne(UserEntity, { where: { id: userId } });
//       if (!user) {
//         throw new NotFoundException(`Usuario con id ${userId} no encontrado`);
//       }

//       const totalQuantity = adults + (children > 0 ? children * 0.5 : 0);

//       const productsArray: OrderDetailsEntity[] = [];
//       const unavailableDates = [];

//       for (const productDto of products) {
//         const product = await transactionalEntityManager.findOne(ProductEntity, { where: { id: productDto.id } });
//         if (!product) {
//           throw new BadRequestException(`Producto con id ${productDto.id} no encontrado`);
//         }

//         const selectedDate = createOrderDto.date; // Suponiendo que la fecha se pasa en el DTO
//         const productDuration = parseInt(product.duration.split(' ')[0], 10);
//         const availableDates = product.travelDate?.availableDates || [];
        
//         if (!availableDates.includes(selectedDate)) {
//           throw new BadRequestException(`La fecha seleccionada ${selectedDate} no está disponible para el producto ${product.title}`);
//         }

//         if (productDuration > 1) {
//           const endDate = new Date(selectedDate);
//           endDate.setDate(endDate.getDate() + productDuration - 1);
//           const endDateString = endDate.toISOString().split('T')[0];

//           // Verifica que la fecha final esté en el rango de fechas disponibles
//           if (!availableDates.includes(endDateString)) {
//             throw new BadRequestException(`Las fechas seleccionadas para el producto ${product.title} no están disponibles.`);
//           }
//         }

//         if (product.stock < totalQuantity) {
//           throw new BadRequestException(`Stock insuficiente para el producto con id ${productDto.id}`);
//         }

//         const productTotal = product.price * totalQuantity;
//         total += productTotal;

//         product.stock -= totalQuantity;
//         await transactionalEntityManager.save(ProductEntity, product);

//         const orderDetail = new OrderDetailsEntity();
//         orderDetail.product = product;
//         orderDetail.quantity = totalQuantity;
//         orderDetail.price = productTotal;
//         productsArray.push(orderDetail);
//       }

//       if (total > 200) {
//         total += (total - 200) * 0.13;
//       }

//       const order = new OrderEntity();
//       order.orderDate = new Date();
//       order.totalPrice = total;
//       order.user = user;

//       const newOrder = await transactionalEntityManager.save(OrderEntity, order);

//       for (const orderDetail of productsArray) {
//         orderDetail.order = newOrder;
//         await transactionalEntityManager.save(OrderDetailsEntity, orderDetail);
//       }
      
//       const orderConStock = await transactionalEntityManager.findOne(OrderEntity, {
//         where: { id: newOrder.id },
//         relations: ['orderDetails', 'orderDetails.product'],
//       });

//       const successUrl = 'https://pf-grupo03-back.onrender.com/payment-success';
//       const cancelUrl = 'https://pf-grupo03-back.onrender.com/payment-cancel';

//                 const session = await stripe.checkout.sessions.create({
//                     payment_method_types: ['card'],
//                     line_items: orderConStock.orderDetails.map(orderDetail => ({
//                         price_data: {
//                             currency: 'usd',
//                             product_data: {
//                                 name: orderDetail.product.title,
//                             },
//                             unit_amount: Math.round((orderDetail.price / orderDetail.quantity) * 100),
//                         },
//                         quantity: orderDetail.quantity,
//                     })),
//                     mode: "payment",
//                     success_url: successUrl,
//                     cancel_url: cancelUrl,
//                 })

//                 newOrder.stripeSessionId = session.id;
//                 await transactionalEntityManager.getRepository(OrderEntity).save(newOrder)

//                 return session.id;

//     // return orderConStock
//     });
//   }

//   async getOrder(id: string) {
//     const order = await this.ordersRepository.findOne({
//       where: { id },
//       relations: ['orderDetails', 'orderDetails.product'],
//     });

//     if (!order) {
//       throw new NotFoundException(`Orden con id ${id} no encontrada`);
//     }

//     return order;
//   }
// }

// import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
// import { InjectEntityManager, InjectRepository } from "@nestjs/typeorm";
// import { EntityManager, Repository } from "typeorm";
// import { OrderEntity } from "./order.entity";
// import { OrderDetailsEntity } from "./orderDetails.entity";
// import { UserEntity } from "../users/user.entity";
// import { ProductEntity } from "../products/product.entity";
// import { CreateOrderDto } from "./orders.dto";
// import { stripe } from "../../config/stripe.config";

// @Injectable()
// export class OrdersRepository {
//   constructor(
//     @InjectEntityManager() private entityManager: EntityManager,
//     @InjectRepository(OrderEntity) private ordersRepository: Repository<OrderEntity>,
//     @InjectRepository(OrderDetailsEntity) private orderDetailsRepository: Repository<OrderDetailsEntity>,
//     @InjectRepository(UserEntity) private usersRepository: Repository<UserEntity>,
//     @InjectRepository(ProductEntity) private productsRepository: Repository<ProductEntity>,
//   ) {}

//   async addOrder(createOrderDto: CreateOrderDto) {
//     const { userId, products, adults = 0, children = 0 } = createOrderDto;
//     let total = 0;

//     return await this.entityManager.transaction(async (transactionalEntityManager) => {
//       const user = await transactionalEntityManager.findOne(UserEntity, { where: { id: userId } });
//       if (!user) {
//         throw new NotFoundException(`Usuario con id ${userId} no encontrado`);
//       }

//       const totalQuantity = adults + (children > 0 ? children * 0.5 : 0);
//       const productsArray: OrderDetailsEntity[] = [];

//       for (const productDto of products) {
//         const product = await transactionalEntityManager.findOne(ProductEntity, { where: { id: productDto.id } });
//         if (!product) {
//           throw new BadRequestException(`Producto con id ${productDto.id} no encontrado`);
//         }

//         const selectedDate = new Date(createOrderDto.date); // Suponiendo que la fecha se pasa en el DTO
//         let productDuration = parseInt(product.duration.split(' ')[0], 10);
//         const availableDates = product.travelDate?.availableDates || [];
//         const selectedDateString = selectedDate.toISOString().split('T')[0];

//         if (!availableDates.includes(selectedDateString)) {
//           throw new BadRequestException(`La fecha seleccionada ${selectedDateString} no está disponible para el producto ${product.title}`);
//         }

//         if (productDuration > 1) {
//           const endDate = new Date(selectedDate);
//           endDate.setDate(endDate.getDate() + productDuration - 1);
//           const endDateString = endDate.toISOString().split('T')[0];

//           if (!availableDates.includes(endDateString)) {
//             throw new BadRequestException(`Las fechas seleccionadas para el producto ${product.title} no están disponibles.`);
//           }

//           productDuration = endDate.getDate() - selectedDate.getDate() + 1;
//         }

//         if (product.stock < totalQuantity) {
//           throw new BadRequestException(`Stock insuficiente para el producto con id ${productDto.id}`);
//         }

//         const productTotal = product.price * totalQuantity;
//         total += productTotal;

//         product.stock -= totalQuantity;
//         await transactionalEntityManager.save(ProductEntity, product);

//         const orderDetail = new OrderDetailsEntity();
//         orderDetail.product = product;
//         orderDetail.quantity = totalQuantity;
//         orderDetail.price = productTotal;
//         productsArray.push(orderDetail);
//       }

//       if (total > 200) {
//         total += (total - 200) * 0.13;
//       }

//       const order = new OrderEntity();
//       order.orderDate = new Date();
//       order.totalPrice = total;
//       order.user = user;

//       const newOrder = await transactionalEntityManager.save(OrderEntity, order);

//       for (const orderDetail of productsArray) {
//         orderDetail.order = newOrder;
//         await transactionalEntityManager.save(OrderDetailsEntity, orderDetail);
//       }
      
//       const orderConStock = await transactionalEntityManager.findOne(OrderEntity, {
//         where: { id: newOrder.id },
//         relations: ['orderDetails', 'orderDetails.product'],
//       });

//       // Agregar fechas de salida y regreso a la respuesta
//       const orderWithDates = {
//         ...orderConStock,
//         orderDetails: orderConStock.orderDetails.map(detail => {
//           const startDate = new Date(createOrderDto.date);
//           const durationDays = parseInt(detail.product.duration.split(' ')[0], 10);
//           const endDate = new Date(startDate);
//           endDate.setDate(startDate.getDate() + durationDays - 1);

//           // Le saco lo que no necesito de orderDetails
//           const { travelDate, isActive, image, image2, image3, stock, ...productWithoutTravelDate } = detail.product;
          
//           return {
//             ...detail,
//             product: {
//               ...productWithoutTravelDate,
//               startDate: startDate.toISOString().split('T')[0],
//               endDate: endDate.toISOString().split('T')[0]
//             }
//           };
//         }),
//       };
//       // return { order: orderWithDates };
//       const successUrl = 'https://pf-grupo03-back.onrender.com/payment-success';
//       const cancelUrl = 'https://pf-grupo03-back.onrender.com/payment-cancel';

//       const session = await stripe.checkout.sessions.create({
//         payment_method_types: ['card'],
//         line_items: orderWithDates.orderDetails.map(orderDetail => ({
//           price_data: {
//             currency: 'usd',
//             product_data: {
//               name: orderDetail.product.title,
//             },
//             unit_amount: Math.round((orderDetail.price / orderDetail.quantity) * 100),
//           },
//           quantity: orderDetail.quantity,
//         })),
//         mode: "payment",
//         success_url: successUrl,
//         cancel_url: cancelUrl,
//       });

//       newOrder.stripeSessionId = session.id;
//       await transactionalEntityManager.getRepository(OrderEntity).save(newOrder);

//       return { sessionId: session.id, order: orderWithDates };
//     });
//   }

//   async getOrder(id: string) {
//     const order = await this.ordersRepository.findOne({
//       where: { id },
//       relations: ['orderDetails', 'orderDetails.product'],
//     });

//     if (!order) {
//       throw new NotFoundException(`Orden con id ${id} no encontrada`);
//     }

//     return order;
//   }
// }

import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { InjectEntityManager, InjectRepository } from "@nestjs/typeorm";
import { EntityManager, Repository } from "typeorm";
import { OrderEntity } from "./order.entity";
import { OrderDetailsEntity } from "./orderDetails.entity";
import { UserEntity } from "../users/user.entity";
import { ProductEntity } from "../products/product.entity";
import { CreateOrderDto } from "./orders.dto";
import { stripe } from "../../config/stripe.config";

@Injectable()
export class OrdersRepository {
  constructor(
    @InjectEntityManager() private entityManager: EntityManager,
    @InjectRepository(OrderEntity) private ordersRepository: Repository<OrderEntity>,
    @InjectRepository(OrderDetailsEntity) private orderDetailsRepository: Repository<OrderDetailsEntity>,
    @InjectRepository(UserEntity) private usersRepository: Repository<UserEntity>,
    @InjectRepository(ProductEntity) private productsRepository: Repository<ProductEntity>,
  ) {}

  async addOrder(createOrderDto: CreateOrderDto) {
    const { userId, products, adults = 0, children = 0 } = createOrderDto;
    let total = 0;

    return await this.entityManager.transaction(async (transactionalEntityManager) => {
      const user = await transactionalEntityManager.findOne(UserEntity, { where: { id: userId } });
      if (!user) {
        throw new NotFoundException(`Usuario con id ${userId} no encontrado`);
      }

      const productsArray: OrderDetailsEntity[] = [];

      for (const productDto of products) {
        const product = await transactionalEntityManager.findOne(ProductEntity, { where: { id: productDto.id } });
        if (!product) {
          throw new BadRequestException(`Producto con id ${productDto.id} no encontrado`);
        }

        const selectedDate = new Date(createOrderDto.date); // Suponiendo que la fecha se pasa en el DTO
        let productDuration = parseInt(product.duration.split(' ')[0], 10);
        const availableDates = product.travelDate?.availableDates || [];
        const selectedDateString = selectedDate.toISOString().split('T')[0];

        if (!availableDates.includes(selectedDateString)) {
          throw new BadRequestException(`La fecha seleccionada ${selectedDateString} no está disponible para el producto ${product.title}`);
        }

        if (productDuration > 1) {
          const endDate = new Date(selectedDate);
          endDate.setDate(endDate.getDate() + productDuration - 1);
          const endDateString = endDate.toISOString().split('T')[0];

          if (!availableDates.includes(endDateString)) {
            throw new BadRequestException(`Las fechas seleccionadas para el producto ${product.title} no están disponibles.`);
          }

          productDuration = endDate.getDate() - selectedDate.getDate() + 1;
        }

        // Calcula el precio basado en adultos y niños
        const adultPrice = product.price;
        const childPrice = adultPrice * 0.5;
        const totalAdults = adults;
        const totalChildren = children;
        const totalAdultPrice = totalAdults * adultPrice;
        const totalChildPrice = totalChildren * childPrice;
        const totalProductPrice = totalAdultPrice + totalChildPrice;

        // Ajusta la cantidad de stock considerando los niños como pasajeros completos
        const totalQuantity = totalAdults + totalChildren; // Redondear a entero, ya que se cuenta como 1 pasajero por niño
        if (product.stock < totalQuantity) {
          throw new BadRequestException(`Stock insuficiente para el producto con id ${productDto.id}`);
        }

        total += totalProductPrice;

        product.stock -= totalQuantity;
        await transactionalEntityManager.save(ProductEntity, product);

        const orderDetail = new OrderDetailsEntity();
        orderDetail.product = product;
        orderDetail.quantity = totalQuantity;
        orderDetail.price = totalProductPrice;
        productsArray.push(orderDetail);
      }

      if (total > 200) {
        const excessAmount = total - 200;
        const tax = excessAmount * 0.13;
        total += tax;
    }

      const order = new OrderEntity();
      order.orderDate = new Date();
      order.totalPrice = total;
      order.user = user;

      const newOrder = await transactionalEntityManager.save(OrderEntity, order);

      for (const orderDetail of productsArray) {
        orderDetail.order = newOrder;
        await transactionalEntityManager.save(OrderDetailsEntity, orderDetail);
      }
      
      const orderConStock = await transactionalEntityManager.findOne(OrderEntity, {
        where: { id: newOrder.id },
        relations: ['orderDetails', 'orderDetails.product'],
      });

      // Agregar fechas de salida y regreso a la respuesta
      const orderWithDates = {
        ...orderConStock,
        orderDetails: orderConStock.orderDetails.map(detail => {
          const startDate = new Date(createOrderDto.date);
          const durationDays = parseInt(detail.product.duration.split(' ')[0], 10);
          const endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + durationDays - 1);

          const { travelDate, isActive, image, image2, image3, stock, ...productWithoutTravelDate } = detail.product;

          return {
            ...detail,
            product: {
              ...productWithoutTravelDate,
              startDate: startDate.toISOString().split('T')[0],
              endDate: endDate.toISOString().split('T')[0]
            }
          };
        }),
      };

      // return { order: orderWithDates };

      const successUrl = 'https://pf-grupo03-back.onrender.com/payment-success';
      const cancelUrl = 'https://pf-grupo03-back.onrender.com/payment-cancel';

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: orderWithDates.orderDetails.map(orderDetail => ({
          price_data: {
            currency: 'usd',
            product_data: {
              name: orderDetail.product.title,
            },
            unit_amount: Math.round((orderDetail.price / orderDetail.quantity) * 100),
          },
          quantity: orderDetail.quantity,
        })),
        mode: "payment",
        success_url: successUrl,
        cancel_url: cancelUrl,
      });

      newOrder.stripeSessionId = session.id;
      await transactionalEntityManager.getRepository(OrderEntity).save(newOrder);

      return { sessionId: session.id, order: orderWithDates };
    });
  }

  async getOrder(id: string) {
    const order = await this.ordersRepository.findOne({
      where: { id },
      relations: ['orderDetails', 'orderDetails.product'],
    });

    if (!order) {
      throw new NotFoundException(`Orden con id ${id} no encontrada`);
    }

    return order;
  }
}

