import { Injectable } from '@angular/core';
import {
  IEntityDictionary,
  Load,
  LoadAll,
  LoadAllFailure,
  LoadAllSuccess,
  LoadFailure,
  LoadMany,
  LoadManyFailure,
  LoadManySuccess,
  LoadPage,
  LoadPageFailure,
  LoadPageSuccess,
  LoadRange,
  LoadRangeFailure,
  LoadRangeSuccess,
  LoadSuccess
} from '@briebug/ngrx-auto-entity';
import { Store } from '@ngrx/store';
import { Product } from 'models/product.model';
import { combineLatest, isObservable, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppState } from 'state/app.state';
import { ProductFacadeBase } from 'state/product.state';

@Injectable({
  providedIn: 'root'
})
export class ProductFacade extends ProductFacadeBase {
  lastLoadAction$: Observable<IEntityLoadActions<Product>>;

  constructor(store: Store<AppState>) {
    super(Product, store);
  }

  mostRecent$(count: number): Observable<Product[]> {
    return this.all$.pipe(
      map(products => {
        products.sort((a, b) => b.dateAdded.localeCompare(a.dateAdded));
        return products;
      }),
      map(products => products.slice(0, count))
    );
  }

  attachByProductId$<TModel = { productId: number }>(
    entitiesWithProductId: Observable<Array<TModel & { productId: number }>> | Array<TModel & { productId: number }>
  ): Observable<Array<TModel & { product: Product | null }>> {
    const combined$ = combineLatest([
      isObservable(entitiesWithProductId) ? entitiesWithProductId : of(entitiesWithProductId),
      this.entities$
    ]);

    return combined$.pipe(
      map(([entities, productsById]: [Array<TModel & { productId: number }>, IEntityDictionary<Product>]) => {
        if (!entities && !productsById) {
          return [];
        }

        return entities.map((item: TModel & { productId: number }) => {
          return { ...item, product: productsById[item.productId] };
        });
      })
    );
  }
}

export type IEntityLoadActions<TModel> =
  | Load<TModel>
  | LoadSuccess<TModel>
  | LoadFailure<TModel>
  | LoadMany<TModel>
  | LoadManySuccess<TModel>
  | LoadManyFailure<TModel>
  | LoadAll<TModel>
  | LoadAllSuccess<TModel>
  | LoadAllFailure<TModel>
  | LoadPage<TModel>
  | LoadPageSuccess<TModel>
  | LoadPageFailure<TModel>
  | LoadRange<TModel>
  | LoadRangeSuccess<TModel>
  | LoadRangeFailure<TModel>;
