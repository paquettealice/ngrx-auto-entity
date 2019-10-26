import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IAutoEntityService, IEntityInfo } from '@briebug/ngrx-auto-entity';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable()
export class EntityService implements IAutoEntityService<any> {
  constructor(private http: HttpClient) {}

  static convertModelFilterToQueryString<TModel = any>(modelFilter: Partial<TModel>): string {
    if (modelFilter) {
      return Object.keys(modelFilter)
        .map((key: string) => `${key}=${encodeURIComponent(modelFilter[key])}`)
        .join('&');
    } else {
      return '';
    }
  }

  load(entityInfo: IEntityInfo, keys: any): Observable<any> {
    return this.http.get<any>(`${environment.API_BASE_URL}/${entityInfo.modelName.toLowerCase()}s/${keys}`);
  }

  loadAll(entityInfo: IEntityInfo): Observable<any[]> {
    return this.http.get<any[]>(`${environment.API_BASE_URL}/${entityInfo.modelName.toLowerCase()}s`);
  }

  loadMany<TModel = any>(entityInfo: IEntityInfo, criteria: IEntityCriteria<TModel>): Observable<TModel[]> {
    const queryString: string = EntityService.convertModelFilterToQueryString(criteria.modelFilter);
    return this.http.get<any[]>(
      `${environment.API_BASE_URL}/${entityInfo.modelName.toLowerCase()}s${queryString ? '?' : ''}${queryString}`
    );
  }

  create(entityInfo: IEntityInfo, entity: any): Observable<any> {
    return this.http.post<any>(`${environment.API_BASE_URL}/${entityInfo.modelName.toLowerCase()}s`, entity);
  }

  update(entityInfo: IEntityInfo, entity: any): Observable<any> {
    return this.http.patch<any>(
      `${environment.API_BASE_URL}/${entityInfo.modelName.toLowerCase()}s/${entity.id}`,
      entity
    );
  }

  replace(entityInfo: IEntityInfo, entity: any): Observable<any> {
    return this.http.put<any>(`${environment.API_BASE_URL}/${entityInfo.modelName.toLowerCase()}s`, entity);
  }

  delete(entityInfo: IEntityInfo, entity: any): Observable<any> {
    return this.http
      .delete<any>(`${environment.API_BASE_URL}/${entityInfo.modelName.toLowerCase()}s/${entity.id}`)
      .pipe(map(() => entity));
  }
}

export interface IEntityCriteria<TModel> {
  modelFilter?: Partial<TModel>;
}
