import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from "@nestjs/common";
import { InjectEntityManager, InjectRepository } from "@nestjs/typeorm";
import { EntityManager, Repository } from "typeorm";
import { OrderEntity } from "./order.entity";
import { OrderDetailsEntity } from "./orderDetails.entity";
import { UserEntity } from "../users/user.entity";
import { ProductEntity } from "../products/product.entity";
import { CreateOrderDto, UpdateOrderDto } from "./orders.dto";
import { stripe } from "../../config/stripe.config";
import { PassengerEntity } from "./passenger.entity";
import { MailRepository } from 'src/mail/mail.repository';
import { classToPlain, instanceToPlain } from "class-transformer";


@Injectable()
export class OrdersRepository {
  constructor(
    @InjectEntityManager() private entityManager: EntityManager,
    @InjectRepository(OrderEntity) private ordersRepository: Repository<OrderEntity>,
    @InjectRepository(OrderDetailsEntity) private orderDetailsRepository: Repository<OrderDetailsEntity>,
    @InjectRepository(UserEntity) private usersRepository: Repository<UserEntity>,
    @InjectRepository(ProductEntity) private productsRepository: Repository<ProductEntity>,
    @InjectRepository(PassengerEntity) private passengersRepository: Repository<PassengerEntity>,
    private readonly mailRepository: MailRepository
  ) {}

  async getOrders(page: number, limit: number) {

    if (page <= 0 || limit <= 0) {
      throw new BadRequestException('Los valores de "page" y "limit" deben ser mayores que cero.');
    }

    const skip = (page - 1) * limit;

    try {

      const [orders, total] = await this.ordersRepository.findAndCount({
        relations: ['orderDetails', 'orderDetails.product', 'passengers'],
        skip,
        take: limit,
        order: {
          orderDate: 'DESC',
        },
      });


      if (orders.length === 0) {
        throw new NotFoundException('No se encontraron órdenes para los parámetros proporcionados.');
      }

      return {
        data: orders,
        total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {

      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException(`Error al obtener órdenes: ${error.message}`);
    }
  }


  async addOrder(createOrderDto: CreateOrderDto) {
    const { userId, products, adults = 0, children = 0, medicalInsurance, passengers } = createOrderDto;
    let total = 0;

    return await this.entityManager.transaction(async (transactionalEntityManager) => {
      const user = await transactionalEntityManager.findOne(UserEntity, { where: { id: userId } });
      if (!user) {
        throw new NotFoundException(`Usuario con id ${userId} no encontrado`);
      }

      const productsArray: OrderDetailsEntity[] = [];
      const passengersArray: PassengerEntity[] = [];

      for (const productDto of products) {
        const product = await transactionalEntityManager.findOne(ProductEntity, { where: { id: productDto.id } });
        if (!product) {
          throw new BadRequestException(`Producto con id ${productDto.id} no encontrado`);
        }

        const selectedDate = new Date(createOrderDto.date);
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


        const adultPrice = product.price;
        const childPrice = adultPrice * 0.5;
        const totalAdults = adults;
        const totalChildren = children;
        const totalAdultPrice = totalAdults * adultPrice;
        const totalChildPrice = totalChildren * childPrice;
        const totalProductPrice = totalAdultPrice + totalChildPrice;


        const totalQuantity = totalAdults + totalChildren;
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

      if (medicalInsurance) {
        total += 100;
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
      order.medicalInsurance = medicalInsurance;

      const newOrder = await transactionalEntityManager.save(OrderEntity, order);

      for (const orderDetail of productsArray) {
        orderDetail.order = newOrder;
        await transactionalEntityManager.save(OrderDetailsEntity, orderDetail);
      }

      if (passengers && passengers.length > 0) {
        for (const passengerDto of passengers) {
          const passenger = new PassengerEntity();
          passenger.name = passengerDto.name;
          passenger.email = passengerDto.email;
          passenger.cellphone = passengerDto.cellphone;
          passenger.dni = passengerDto.dni;
          passenger.order = newOrder;

          passengersArray.push(passenger);
        }

        await transactionalEntityManager.save(PassengerEntity, passengersArray);
      }

      const orderConStock = await transactionalEntityManager.findOne(OrderEntity, {
        where: { id: newOrder.id },
        relations: ['orderDetails', 'orderDetails.product', 'passengers'],
      });

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

      await this.mailRepository.sendOrderConfirmationEmail(orderWithDates, user);

        const successUrl = 'https://pf-grupo03.vercel.app/pay-succes';
        const cancelUrl = 'https://pf-grupo03.vercel.app/pay-failed';
        
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
          metadata: {
            order_id: newOrder.id,
          },
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

  async getOrdersByUserId(userId: string): Promise<Partial<UpdateOrderDto[]>> {
 /*   return await this.ordersRepository.find({
      where: { user: { id: userId}},
      relations: ['orderDetails', 'orderDetails.product', 'passengers'],
    });} */

   const orders = await this.ordersRepository.find({
      where: { user: { id: userId } },
      relations: ['orderDetails', 'orderDetails.product', 'passengers'],
    });

    return orders.map(order => {
      const plainOrder = instanceToPlain(order);
      plainOrder.orderDetails.forEach(detail => {
        delete detail.product.travelDate;
      });
      return plainOrder;
    });
  }

  async deleteOrder(id: string) {
    try {
      const orderById = await this.ordersRepository.findOne({
        where: { id, isActive: true},
      });
      if(!orderById) {
        throw new NotFoundException(`Orden con ID ${id} no encontrada`);
      }
      orderById.isActive = false;
      await this.ordersRepository.save(orderById);
      return {
        Message: 'Orden eliminada correctamente',
      };
    } catch (error) {
      if(error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al eliminar la orden: ' + error.message);
    }
  }
}