import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { ProductFacade } from 'facades/product.facade';
import { Product } from 'models/product.model';
import { Observable } from 'rxjs';
import { filter, map, mapTo, switchMap, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ProductsResolver implements Resolve<IProductsResolverData> {
  constructor(private productFacade: ProductFacade) {}

  resolve(snapshot: ActivatedRouteSnapshot): Observable<IProductsResolverData> {
    const params: IProductsResolverParams = snapshot.data;

    return this.productFacade.loadedAt$.pipe(
      take(1),
      map((loadedAt: Date) => {
        const hasTimedOut = true; // Unreliable without loadLastAction implemented
        // !loadedAt || new Date().getTime() - loadedAt.getTime() > 60000;
        return hasTimedOut;
      }),
      switchMap((hasTimedOut: boolean) => {
        if (params.criteria) {
          this.productFacade.clear();
          this.productFacade.loadMany(params.criteria);
        } else if (hasTimedOut) {
          this.productFacade.clear();
          this.productFacade.loadAll();
        }

        return this.productFacade.loadedAt$.pipe(filter(loadedAt => !!loadedAt));
      }),
      take(1),
      mapTo({ products$: this.productFacade.all$ })
    );
  }
}

export interface IProductsResolverData {
  products$: Observable<Product[]>;
}

export interface IProductsResolverParams {
  criteria?: Partial<Product>;
  expiryTimeInMs?: number | 60000;
  forceReload?: boolean;
}
