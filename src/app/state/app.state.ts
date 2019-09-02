import { IEntityState } from '@briebug/ngrx-auto-entity';
import { routerReducer, RouterReducerState } from '@ngrx/router-store';
import { ActionReducerMap, MetaReducer } from '@ngrx/store';
import { storeFreeze } from 'ngrx-store-freeze';

import { environment } from '../../environments/environment';

import { Account, Customer, Order, Product } from '../models';
import { IRouterStateUrl } from './shared/utils';

import { accountReducer } from './account.state';
import { customerReducer } from './customer.state';
import { orderReducer } from './order.state';
import { productReducer } from './product.state';

export interface IAppState {
  router: RouterReducerState<IRouterStateUrl>;
  customer: IEntityState<Customer>;
  account: IEntityState<Account>;
  order: IEntityState<Order>;
  product: IEntityState<Product>;
}

export type AppState = IAppState;

export const appReducer: ActionReducerMap<AppState> = {
  router: routerReducer,
  customer: customerReducer,
  account: accountReducer,
  order: orderReducer,
  product: productReducer
};

export const appMetaReducers: Array<MetaReducer<AppState>> = !environment.production ? [storeFreeze] : [];
