import { Injectable } from '@angular/core';
import { IEntityDictionary } from '@briebug/ngrx-auto-entity';
import { Store } from '@ngrx/store';
import { Customer } from 'models/customer.model';
import { combineLatest, isObservable, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppState } from 'state/app.state';
import { CustomerFacadeBase } from 'state/customer.state';

@Injectable({
  providedIn: 'root'
})
export class CustomerFacade extends CustomerFacadeBase {
  constructor(store: Store<AppState>) {
    super(Customer, store);
  }

  get active$(): Observable<Customer[]> {
    return this.all$.pipe(map(customers => customers.filter(customer => customer.isActive)));
  }

  top$(count: number): Observable<Customer[]> {
    return this.active$.pipe(map(customers => customers.slice(0, count)));
  }

  attachByCustomerId$<TModel = { customerId: number }>(
    entitiesWithCustomerId: Observable<Array<TModel & { customerId: number }>> | Array<TModel & { customerId: number }>
  ): Observable<Array<TModel & { customer: Customer | null }>> {
    const combined$ = combineLatest([
      isObservable(entitiesWithCustomerId) ? entitiesWithCustomerId : of(entitiesWithCustomerId),
      this.entities$
    ]);

    return combined$.pipe(
      map(([entities, customersById]: [Array<TModel & { customerId: number }>, IEntityDictionary<Customer>]) => {
        if (!entities && !customersById) {
          return [];
        }

        return entities.map((item: TModel & { customerId: number }) => {
          return { ...item, customer: customersById[item.customerId] };
        });
      })
    );
  }
}
