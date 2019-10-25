import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MatTableDataSource } from '@angular/material';
import { OrderInfo } from 'models/orderInfo';
import { Router } from '@angular/router';

@Component({
  selector: 'app-orders-preview-table',
  templateUrl: './orders-preview-table.component.html',
  styleUrls: ['./orders-preview-table.component.scss']
})
export class OrdersPreviewTableComponent implements OnChanges {
  @Input() orders: OrderInfo[];

  columnsToDisplay = ['customer', 'dateOfOrder', 'status'];
  dataSource = new MatTableDataSource();

  constructor() {}

  ngOnChanges(simpleChanges: SimpleChanges) {
    if (simpleChanges.orders && simpleChanges.orders.currentValue) {
      this.dataSource.data = this.orders;
    }
  }
}
