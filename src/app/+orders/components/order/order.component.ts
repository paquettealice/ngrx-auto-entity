import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subject, combineLatest } from 'rxjs';
import { first, map, switchMap, take, takeUntil, debounceTime, filter } from 'rxjs/operators';
import { IEntityDictionary } from '../../../../../projects/ngrx-auto-entity/src';
import { Product } from '../../../models/product.model';
import { OrderItemFacade } from '../../facades/orderItem.facade';
import { OrderItem } from '../../models/orderItem.model';
import { IOrderItemWithProduct } from '../../orders.interface';
import { ProductFacade } from '../../../facades/product.facade';
import { Order } from '../../../models/order.model';
import { OrderFacade } from '../../../facades/order.facade';

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss']
})
export class OrderComponent implements OnInit, OnDestroy {
  productsById$: Observable<IEntityDictionary<Product>>;

  orderId$: Observable<number>;
  order$: Observable<Order>;
  orderItems$: Observable<OrderItem[]>;
  orderItemsWithProduct$: Observable<IOrderItemWithProduct[]>;

  destroy$: Subject<void> = new Subject<void>();

  constructor(
    private activatedRoute: ActivatedRoute,
    private orderFacade: OrderFacade,
    private orderItemFacade: OrderItemFacade,
    private productFacade: ProductFacade
  ) {
    this.initOrderId$();
    this.initOrder$();
    this.initOrderItems$();
    this.initLoadOrderItemsForOrderId();

    this.initLoadProducts();
    this.initProductsById$();

    this.initOrderItemsWithProducts$();
    console.log('snapshot', this.activatedRoute.snapshot);
  }

  ngOnInit() {}

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

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

  private initOrderItems$() {
    this.orderItems$ = this.orderId$.pipe(
      switchMap((orderId: number) => this.orderItemFacade.getAllForOrderId$(orderId)),
      takeUntil(this.destroy$)
    );
  }

  private initLoadOrderItemsForOrderId() {
    this.orderId$.pipe(take(1)).subscribe((orderId: number) => {
      this.orderItemFacade.loadAllForOrderId(orderId);
    });
  }

  private initLoadProducts() {
    this.productFacade.loadAll();
  }

  private initProductsById$() {
    this.productsById$ = this.productFacade.entities$;
  }

  private initOrderItemsWithProducts$() {
    this.orderItemsWithProduct$ = combineLatest([this.orderItems$, this.productsById$]).pipe(
      map(([items, productsById]: [OrderItem[], IEntityDictionary<Product>]) => {
        if (!items || !productsById) {
          return null;
        }

        return items.map(
          (item: OrderItem): IOrderItemWithProduct => {
            return { ...item, product: productsById[item.productId] };
          }
        );
      })
    );
  }
}
