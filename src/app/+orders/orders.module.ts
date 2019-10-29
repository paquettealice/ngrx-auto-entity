import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgrxAutoEntityModule } from '@briebug/ngrx-auto-entity';
import { StoreModule } from '@ngrx/store';
import { MaterialModule } from '../material.module';
import { OrderComponent } from './components/order/order.component';
import { OrderItem } from './models/order-item.model';
import { routes } from './orders.routing';
import { FeatureEntityService } from './services/feature-entity.service';
import { featureReducer } from './state/feature.reducer';

@NgModule({
  declarations: [OrderComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    StoreModule.forFeature('orders', featureReducer),
    NgrxAutoEntityModule.forFeature(),
    MaterialModule,
  ],
  providers: [{ provide: OrderItem, useClass: FeatureEntityService }]
})
export class OrdersModule {}
