import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ProductFacade } from '../../facades/product.facade';
import { OrderItem } from '../models/order-item.model';
import { FeatureState } from '../state/feature.state';
import { OrderItemFacadeBase } from '../state/order-item.state';

@Injectable({
  providedIn: 'root'
})
export class OrderItemFacade extends OrderItemFacadeBase {
  constructor(private productFacade: ProductFacade, store: Store<FeatureState>) {
    super(OrderItem, store);
  }

  // Selection
  getAllForOrderId$(orderId: number): Observable<OrderItem[]> {
    return this.all$.pipe(
      map((orderItems: OrderItem[]) => {
        return orderItems ? orderItems.filter((item: OrderItem) => item.orderId === +orderId) : [];
      })
    );
  }

  // Dispatch
  loadAllForOrderId(orderId: number): void {
    this.loadAll({ orderId: +orderId });
  }

  unload(): void {
    this.clear();
  }
}
