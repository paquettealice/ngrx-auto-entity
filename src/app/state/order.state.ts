import { buildState, IEntityState } from '@briebug/ngrx-auto-entity';
import { props } from '@ngrx/store';
import { OrderItem } from 'models/order-item.model';
import { Order } from 'models/order.model';
import { createCorrelatedAction } from 'shared/libs/actions.lib';

export const { initialState, facade: OrderFacadeBase, entityState: OrdersEntityState } = buildState(Order);

export function orderReducer(state = initialState): IEntityState<Order> {
  return state;
}

/* Actions */
export interface ICreateFullOrderProps {
  order: Readonly<Exclude<Order, 'id'>>,
  orderItems: ReadonlyArray<Exclude<OrderItem, 'orderId'>>
}
export const createFullOrder = createCorrelatedAction(
  '[Orders] Create Full Order',
  props<ICreateFullOrderProps>()
)