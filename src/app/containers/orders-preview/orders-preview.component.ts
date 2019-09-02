import { Component } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { CustomerFacade, OrderFacade, OrderManagerFacade } from '../../facades';
import { OrderStatus } from '../../models';

const DEFAULT_STATUS = [OrderStatus.open, OrderStatus.completed];

@Component({
  selector: 'app-orders-preview',
  templateUrl: './orders-preview.component.html',
  styleUrls: ['./orders-preview.component.scss']
})
export class OrdersPreviewComponent {
  status$ = new BehaviorSubject(DEFAULT_STATUS);

  constructor(
    public orderManager: OrderManagerFacade,
    private orderFacade: OrderFacade,
    private customerFacade: CustomerFacade
  ) {
    orderFacade.loadAll();
    customerFacade.loadAll();
  }

  setStatus(status: OrderStatus[]) {
    this.status$.next(status || DEFAULT_STATUS);
  }
}
