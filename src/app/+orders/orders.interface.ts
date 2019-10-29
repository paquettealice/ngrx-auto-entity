import { Customer } from 'models/customer.model';
import { Order } from 'models/order.model';
import { Product } from '../models/product.model';
import { OrderItem } from './models/order-item.model';

export interface IOrderWithCustomer extends Order {
  customer: Customer;
}
export interface IOrderItemWithProduct extends OrderItem {
  product: Product;
}
