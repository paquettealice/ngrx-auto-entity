import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { EntityActionTypes, EntityOperators, ofEntityType, Create, CreateSuccess } from '@briebug/ngrx-auto-entity';
import { Actions, Effect, ofType, createEffect } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { Order } from 'models/order.model';
import { Observable } from 'rxjs';
import { map, tap, filter, mergeMap, take } from 'rxjs/operators';
import { Go } from './router/router.actions';
import { createFullOrder, ICreateFullOrderProps } from 'state/order.state';
import { AppState } from 'state/app.state';
import { OrderItem } from 'models/order-item.model';

@Injectable()
export class OrderEffects {
  @Effect({ dispatch: false })
  createSuccess$: Observable<Action> = this.actions$.pipe(
    ofEntityType(Order, EntityActionTypes.CreateSuccess),
    tap(() => this.matSnackBar.open('Order Created', 'Success', { duration: 2000 })),
  );

  @Effect({ dispatch: false })
  deleteSuccessSnackBar$ = this.actions$.pipe(
    ofEntityType(Order, EntityActionTypes.DeleteSuccess),
    tap(() => this.matSnackBar.open('Order Deleted', 'Success', { duration: 2000 }))
  );

  @Effect({ dispatch: false })
  updateSuccessSnackBar$ = this.actions$.pipe(
    ofEntityType(Order, EntityActionTypes.UpdateSuccess),
    tap(() => this.matSnackBar.open('Order Updated', 'Success', { duration: 2000 })),
  );

  createFullOrder$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(createFullOrder),
      tap(({ order, correlationId }) => this.store.dispatch(new Create(Order, order, undefined, correlationId))),
      mergeMap(({ correlationId, orderItems }) => {
        return this.actions$.pipe(
          ofEntityType(Order, EntityActionTypes.CreateSuccess),
          filter((createOrderSuccess: CreateSuccess<Order>) => correlationId === createOrderSuccess.correlationId),
          take(1),
          tap((createOrderSuccess: CreateSuccess<Order>) => {
            orderItems.forEach((item: Exclude<OrderItem, 'orderId'>) => {
              const payload: OrderItem = {
                ...item,
                orderId: createOrderSuccess.entity.id
              };
              this.store.dispatch(new Create(OrderItem, payload, undefined, correlationId));
            })
          })
        );
      }),
    )
  }, { dispatch: false })

  constructor(private actions$: Actions, private ops: EntityOperators, private matSnackBar: MatSnackBar, private store: Store<AppState>) {}
}
