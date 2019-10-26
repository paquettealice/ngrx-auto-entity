import { Routes } from '@angular/router';
import { ProductsResolver } from 'src/app/+products/resolvers/products.resolver';
import { OrderComponent } from './components/order/order.component';

export const routes: Routes = [
  {
    path: ':id',
    component: OrderComponent,
    resolve: [ProductsResolver]
  }
];
