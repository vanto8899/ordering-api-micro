import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { BILLING_SERVICE } from './constants/services';
import { CreateOrderRequest } from './dto/create-order.request';
import { OrdersRepository } from './orders.repository';

@Injectable()
export class OrdersService {
  constructor(
    private readonly ordersRepository: OrdersRepository,
    @Inject(BILLING_SERVICE) private billingClient: ClientProxy,
  ) {}

  async createOrder(request: CreateOrderRequest, authentication: string) {
    try {
      // Create the order
      const order = await this.ordersRepository.create(request);
  
      // Emit the event to billing service
      await lastValueFrom(
        this.billingClient.emit('order_created', {
          request,
          Authentication: authentication,
        }),
      );
  
      // Return the created order
      return order;
    } catch (err) {
      // Handle the error (you might want to log it or perform some additional action)
      throw err;
    }
  }

  async getOrders() {
    return this.ordersRepository.find({});
  }
}