import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CustomerFacade } from 'facades/customer.facade';
import { OrderFacade } from 'facades/order.facade';
import { ProductFacade } from 'facades/product.facade';
import { Order } from 'models/order.model';
import { Observable } from 'rxjs';
import { filter, first, map, switchMap, take } from 'rxjs/operators';
import { OrderItemFacade } from 'src/app/+orders/facades/orderItem.facade';
import { OrderItem } from 'src/app/+orders/models/orderItem.model';
import { IOrderItemWithProduct, IOrderWithCustomer } from 'src/app/+orders/orders.interface';

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss']
})
export class OrderComponent implements OnInit {
  orderId$: Observable<number>;
  order$: Observable<Order>;
  orderWithCustomer$: Observable<IOrderWithCustomer>;

  orderItemsWithProduct$: Observable<IOrderItemWithProduct[]>;

  constructor(
    private activatedRoute: ActivatedRoute,
    private orderFacade: OrderFacade,
    private orderItemFacade: OrderItemFacade,
    private productFacade: ProductFacade,
    private customerFacade: CustomerFacade
  ) {
    this.initOrderId$();
    this.initOrder$();
    this.initOrderWithCustomer$();

    this.initOrderItems$();

    this.initLoadOrderItemsForOrderId();
    this.initLoadCustomerForOrder();
    this.initLoadProducts();

    console.log('snapshot', this.activatedRoute.snapshot);
  }

  ngOnInit() {}

  /* Init */
  private initOrderId$() {
    this.orderId$ = this.activatedRoute.params.pipe(
      map((params: { id: string }) => +params.id),
      first(id => !!id)
    );
  }

  private initOrder$() {
    this.orderId$.pipe(take(1)).subscribe((id: number) => {
      this.orderFacade.load(id);
      this.orderFacade.selectByKey(id);
    });

    this.order$ = this.orderFacade.current$.pipe(filter(order => !!order));
  }

  private initOrderWithCustomer$() {
    this.orderWithCustomer$ = this.order$.pipe(
      switchMap((order: Order) => this.customerFacade.attachByCustomerId$([order])),
      map(([order]) => order)
    );
  }

  private initOrderItems$() {
    this.orderItemsWithProduct$ = this.orderId$.pipe(
      switchMap((orderId: number) => this.orderItemFacade.getAllForOrderId$(orderId)),
      switchMap((items: OrderItem[]) => this.productFacade.attachByProductId$(items))
    );
  }

  private initLoadOrderItemsForOrderId() {
    this.orderId$.pipe(take(1)).subscribe((orderId: number) => {
      this.orderItemFacade.loadAllForOrderId(orderId);
    });
  }

  private initLoadCustomerForOrder() {
    this.order$.pipe(take(1)).subscribe((order: Order) => {
      this.customerFacade.loadMany({ id: order.customerId });
    });
  }

  private initLoadProducts() {
    this.productFacade.loadAll();
  }
}
