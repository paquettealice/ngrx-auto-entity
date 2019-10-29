import { Injectable } from '@angular/core';
import { CustomerFacade } from 'facades/customer.facade';
import { OrderFacade } from 'facades/order.facade';
import { OrderStatus } from 'models/order.model';
import { OrderInfo } from 'models/orderInfo';
import { Observable } from 'rxjs';
import { map, switchMap, withLatestFrom } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  constructor(private orderFacade: OrderFacade, private customerFacade: CustomerFacade) {}

  orderInfoByStatus$(status$: Observable<OrderStatus[]>): Observable<OrderInfo[]> {
    return status$.pipe(
      switchMap(status =>
        this.orderFacade.ofStatus(status).pipe(
          withLatestFrom(this.customerFacade.all$),
          map(([orders, customers]) =>
            orders
              .map(order => ({
                order,
                customer: customers.find(customer => customer.id === order.customerId)
              }))
              .map(
                customerOrder =>
                  ({
                    id: customerOrder.order.id,
                    customer: customerOrder.customer ? customerOrder.customer.name : '<unknown>',
                    dateOfOrder: customerOrder.order.dateOfOrder,
                    status: customerOrder.order.status
                  } as OrderInfo)
              )
          )
        )
      )
    );
  }

  recentOrderInfoByStatus$(count: number, status$: Observable<OrderStatus[]>): Observable<OrderInfo[]> {
    return this.orderInfoByStatus$(status$).pipe(
      map(orders => {
        orders.sort((a, b) => b.dateOfOrder.localeCompare(a.dateOfOrder));
        return orders.slice(0, count);
      })
    );
  }
}
