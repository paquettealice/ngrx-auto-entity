import { Product } from '../models/product.model';
import { OrderItem } from './models/orderItem.model';

export interface IOrderItemWithProduct extends OrderItem {
  product: Product;
}
