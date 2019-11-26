import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { Create, CreateSuccess, EntityActionTypes, EntityOperators, ofEntityType, Update, UpdateSuccess } from '@briebug/ngrx-auto-entity';
import { Actions, createEffect, Effect, ofType } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { AccountFacade } from 'facades/account.facade';
import { Account } from 'models/account.model';
import { OrderItem } from 'models/order-item.model';
import { Order } from 'models/order.model';
import { Observable, of } from 'rxjs';
import { filter, map, mergeMap, take, tap, switchMapTo, switchMap } from 'rxjs/operators';
import { PartialPick } from 'shared/types/util.type';
import { AppState } from 'state/app.state';
import { upsertFullOrder } from 'state/order.state';

@Injectable()
export class OrderEffects {
  @Effect({ dispatch: false })
  createSuccess$: Observable<Action> = this.actions$.pipe(
    ofEntityType(Order, EntityActionTypes.CreateSuccess),
    tap(() => this.matSnackBar.open('Order Created', 'Success', { duration: 2000 }))
  );

  @Effect({ dispatch: false })
  deleteSuccessSnackBar$ = this.actions$.pipe(
    ofEntityType(Order, EntityActionTypes.DeleteSuccess),
    tap(() => this.matSnackBar.open('Order Deleted', 'Success', { duration: 2000 }))
  );

  @Effect({ dispatch: false })
  updateSuccessSnackBar$ = this.actions$.pipe(
    ofEntityType(Order, EntityActionTypes.UpdateSuccess),
    tap(() => this.matSnackBar.open('Order Updated', 'Success', { duration: 2000 }))
  );

  upsertFullOrder$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(upsertFullOrder),
        mergeMap(({ order, orderItems, correlationId }) => {
          console.log('upsert', order);
          if (!order.accountId) {
            this.store.dispatch(new Create(Account, AccountFacade.getNewPersonalTab(order.customerId)));
            return of().pipe(
              tap(() => {
                console.log('dispatched account create');
                // this.store.dispatch(new Create(Account, AccountFacade.getNewPersonalTab(order.customerId)));
              }),
              switchMapTo(this.actions$),
              ofEntityType(Account, EntityActionTypes.CreateSuccess),
              filter((success: CreateSuccess<Account>) => correlationId === success.correlationId),
              take(1),
              map((success: CreateSuccess<Account>) => ({
                order: { ...order, accountId: success.entity.id },
                orderItems,
                correlationId
              }))
            );
          } else {
            return of({ order, orderItems, correlationId });
          }
        }),
        tap(({ order, correlationId }) => {
          if (order.id) {
            this.store.dispatch(new Update(Order, order, undefined, correlationId));
          } else {
            this.store.dispatch(new Create(Order, order, undefined, correlationId));
          }
        }),
        mergeMap(({ orderItems, correlationId }) => {
          return this.actions$.pipe(
            ofEntityType(Order, EntityActionTypes.CreateSuccess, EntityActionTypes.UpdateSuccess),
            filter((success: CreateSuccess<Order> | UpdateSuccess<Order>) => correlationId === success.correlationId),
            take(1),
            tap((success: CreateSuccess<Order> | UpdateSuccess<Order>) => {
              orderItems.forEach((item: PartialPick<OrderItem, 'orderId' | 'id'>) => {
                const payload: OrderItem = {
                  id: undefined,
                  ...item,
                  orderId: success.entity.id
                };

                if (payload.id) {
                  this.store.dispatch(new Update(OrderItem, payload, undefined, correlationId));
                } else {
                  this.store.dispatch(new Create(OrderItem, payload, undefined, correlationId));
                }
              });
            })
          );
        })
      );
    },
    { dispatch: false }
  );

  constructor(
    private actions$: Actions,
    private ops: EntityOperators,
    private matSnackBar: MatSnackBar,
    private store: Store<AppState>
  ) {}
}
