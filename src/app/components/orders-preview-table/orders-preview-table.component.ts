import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { MatTableDataSource } from '@angular/material';
import { OrderInfo } from 'models/orderInfo';
import { BehaviorSubject, Observable, of, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

const DEFAULT_COLUMNS: OrdersPreviewTableColumns[] = ['customer', 'dateOfOrder', 'status'];

@Component({
  selector: 'app-orders-preview-table',
  templateUrl: './orders-preview-table.component.html',
  styleUrls: ['./orders-preview-table.component.scss'],
  animations: [
    trigger('hiddenRowExpand', [
      state('collapsed', style({ height: '0px' })),
      state('expanded', style({ height: '*' })),
      transition('expanded => collapsed', animate('0.3s')),
      transition('collapsed => expanded', animate('0.3s'))
    ])
  ]
})
export class OrdersPreviewTableComponent implements OnChanges, OnDestroy {
  @Input() orders: OrderInfo[];
  @Input() set showUserActions(shouldDisplay: boolean) {
    this._showDisplayActions$.next(shouldDisplay);
  }

  _showDisplayActions$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  columnsToDisplay$: Observable<OrdersPreviewTableColumns[]>;
  dataSource = new MatTableDataSource();

  selectedRow: OrderInfo;

  constructor() {
    this.initColumnsToDisplay$();
  }

  ngOnChanges(simpleChanges: SimpleChanges) {
    if (simpleChanges.orders && simpleChanges.orders.currentValue) {
      this.dataSource.data = this.orders;
    }
  }

  ngOnDestroy() {
    this._showDisplayActions$.complete();
  }

  private initColumnsToDisplay$() {
    this.columnsToDisplay$ = combineLatest([of(DEFAULT_COLUMNS), this._showDisplayActions$]).pipe(
      map(
        ([defaultColumns, showDisplayActions]: [OrdersPreviewTableColumns[], boolean]): OrdersPreviewTableColumns[] => {
          return showDisplayActions ? [...defaultColumns, 'userActions'] : defaultColumns;
        }
      )
    );
  }
}

export type OrdersPreviewTableColumns = keyof Pick<OrderInfo, 'customer' | 'dateOfOrder' | 'status'> | 'userActions';
