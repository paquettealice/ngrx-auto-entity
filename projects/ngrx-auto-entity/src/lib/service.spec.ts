import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { IEntityInfo } from './actions';
import { Page, Range } from './models';
import {
  failResolution,
  getService,
  IAutoEntityService,
  IEntityWithPageInfo,
  IEntityWithRangeInfo,
  logAndThrow,
  logErrorDetails,
  logServiceLocateFailure,
  NgrxAutoEntityService,
  notAFunction,
  notImplemented,
  resolveService,
  resolveServiceDeep
} from './service';

export class TestModel {
  id: number;
  parentId?: number;
  surrogateKey?: string;
  name: string;
}

@Injectable()
export class TestModelService implements IAutoEntityService<TestModel> {
  load(entityInfo: IEntityInfo, keys: any): Observable<TestModel> {
    if (keys === 1234 || keys.id === 1234 || keys.surrogateKey === 'test_1234') {
      return of({ id: 1234, surrogateKey: 'test_1234', parentId: 1, name: 'Test' });
    }
    return throwError({ message: 'Entity not found' });
  }

  loadAll(entityInfo: IEntityInfo, criteria?: any): Observable<TestModel[]> {
    if (entityInfo.modelName !== 'TestModel') {
      return throwError({ message: 'Service not found' });
    } else {
      return of([{ id: 1234, surrogateKey: 'test_1234', parentId: 1, name: 'Test' }]);
    }
  }

  loadPage(entityInfo: IEntityInfo, page: Page, criteria?: any): Observable<IEntityWithPageInfo<TestModel>> {
    if (entityInfo.modelName !== 'TestModel') {
      return throwError({ message: 'Service not found' });
    } else if (page.page === 1) {
      return of({
        entities: [
          {
            id: 1234,
            surrogateKey: 'test_1234',
            parentId: 1,
            name: 'Test'
          }
        ],
        pageInfo: {
          page: {
            page: 1,
            size: 1
          },
          totalCount: 1
        }
      });
    } else {
      return of({
        entities: [],
        pageInfo: {
          page,
          totalCount: 1
        }
      });
    }
  }

  loadRange(entityInfo: IEntityInfo, range: Range, criteria?: any): Observable<IEntityWithRangeInfo<TestModel>> {
    if (entityInfo.modelName !== 'TestModel') {
      return throwError({ message: 'Service not found' });
    }

    // @ts-ignore
    if ((range.start <= 1234 && range.end >= 1234) || (range.first <= 1234 && range.last >= 1234)) {
      return of({
        entities: [
          {
            id: 1234,
            surrogateKey: 'test_1234',
            parentId: 1,
            name: 'Test'
          }
        ],
        rangeInfo: {
          range,
          totalCount: 1
        }
      });
    }

    return of({
      entities: [],
      rangeInfo: {
        range,
        totalCount: 1
      }
    });
  }

  create(entityInfo: IEntityInfo, entity: TestModel, criteria?: any): Observable<TestModel> {
    if (entityInfo.modelName !== 'TestModel') {
      return throwError({ message: 'Service not found' });
    } else {
      return of(entity);
    }
  }

  update(entityInfo: IEntityInfo, entity: TestModel, criteria?: any): Observable<TestModel> {
    if (entityInfo.modelName !== 'TestModel') {
      return throwError({ message: 'Service not found' });
    } else {
      return of(entity);
    }
  }

  updateMany(entityInfo: IEntityInfo, entities: TestModel[], criteria?: any): Observable<TestModel[]> {
    if (entityInfo.modelName !== 'TestModel') {
      return throwError({ message: 'Service not found' });
    } else {
      return of(entities);
    }
  }

  replace(entityInfo: IEntityInfo, entity: TestModel, criteria?: any): Observable<TestModel> {
    if (entityInfo.modelName !== 'TestModel') {
      return throwError({ message: 'Service not found' });
    } else {
      return of(entity);
    }
  }

  delete(entityInfo: IEntityInfo, entity: TestModel, criteria?: any): Observable<TestModel> {
    if (entityInfo.modelName !== 'TestModel') {
      return throwError({ message: 'Service not found' });
    } else {
      return of(entity);
    }
  }
}

describe('NgRX Auto-Entity: Service', () => {
  let entityService: NgrxAutoEntityService;

  const entityInfo: IEntityInfo = {
    modelName: 'TestModel',
    modelType: TestModel
  };

  const entity: TestModel = {
    id: 5678,
    name: 'TestEntity'
  };

  const badEntityInfo: IEntityInfo = {
    modelName: 'SomeModel',
    modelType: TestModel
  };

  describe('Function: notImplemented', () => {
    test('Should return "Entity service method "load" has not been implemented. (Entity: TestModel)"', () => {
      const msg = notImplemented('load', { modelName: 'TestModel', modelType: TestModel });
      expect(msg).toBe('Entity service method "load" has not been implemented. (Entity: TestModel)');
    });
  });

  describe('Function: notAFunction', () => {
    test('Should return "Entity service method "load" is not a function. (Entity: TestModel)"', () => {
      const msg = notAFunction('load', { modelName: 'TestModel', modelType: TestModel });
      expect(msg).toBe('Entity service method "load" is not a function. (Entity: TestModel)');
    });
  });

  describe('Function: logAndThrow', () => {
    test('Should throw and console log "[NGRX-AE] ! Service error: load(). (Entity: TestModel)"', () => {
      let consoleMsgs = [];
      jest.spyOn(console, 'error').mockImplementation(msg => {
        consoleMsgs = [...consoleMsgs, msg];
      });
      logAndThrow(
        'load',
        { message: 'StaticInjector error' },
        {
          modelName: 'TestModel',
          modelType: TestModel
        }
      ).subscribe(
        () => {},
        thrown => {
          expect(thrown).toEqual({
            info: { modelName: 'TestModel', modelType: TestModel },
            err: { message: 'StaticInjector error' }
          });
          expect(consoleMsgs.length).toBe(2);
          expect(consoleMsgs[0]).toBe('[NGRX-AE] ! Service error: load(). (Entity: TestModel)');
          expect(consoleMsgs[1]).toBe("{ message: 'StaticInjector error' }");
        }
      );
    });
  });

  describe('Function: logServiceLocateFailure', () => {
    test('Should log "[NGRX-AE] ! Error: Unable to locate service "TestModelService" using model name of "TestModel"', () => {
      jest.spyOn(console, 'error').mockImplementation(msg => {
        expect(msg).toBe(
          '[NGRX-AE] ! Error: Unable to locate service "TestModelService" using model name of "TestModel"'
        );
      });
      logServiceLocateFailure({ modelName: 'TestModel', modelType: TestModel }, 'TestModelService');
    });
  });

  describe('Function: logErrorDetails', () => {
    test('Should log "[NGRX-AE] ! Error Details:', () => {
      jest.spyOn(console, 'error').mockImplementation(msg => {
        expect(msg).toBe('[NGRX-AE] ! Error Details:');
      });
      logErrorDetails({ message: 'StaticInjector error' });
    });
  });

  describe('Function: failResolution', () => {
    test('Should throw and console log error message and detail', () => {
      let consoleMsgs = [];
      try {
        jest.spyOn(console, 'error').mockImplementation(msg => {
          consoleMsgs = [...consoleMsgs, msg];
        });
        failResolution(
          {
            info: { modelName: 'TestModel', modelType: TestModel },
            err: { message: 'StaticInjector error' }
          },
          { modelName: 'TestModel', modelType: TestModel }
        );
      } catch (err) {
        expect(err).toEqual({
          info: { modelName: 'TestModel', modelType: TestModel },
          err: { message: 'StaticInjector error' }
        });
        expect(consoleMsgs.length).toBe(2);
        expect(consoleMsgs[0]).toBe(
          '[NGRX-AE] ! Error: Unable to locate service "TestModelService" using model name of "TestModel"'
        );
        expect(consoleMsgs[1]).toBe('[NGRX-AE] ! Error Details:');
      }
    });
  });

  describe('Angular Dependent', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [HttpClientModule, CommonModule],
        providers: [{ provide: TestModel, useClass: TestModelService }, NgrxAutoEntityService]
      });
      entityService = TestBed.get(NgrxAutoEntityService);
    });

    describe('Function: getService', () => {
      let injector: Injector;
      beforeEach(() => {
        injector = TestBed.get(Injector);
      });

      test('Should resolve service with default injector', () => {
        const service = getService({ modelName: 'TestModel', modelType: TestModel }, injector);
        expect(service).toBeTruthy();
        expect(service).toBeInstanceOf(TestModelService);
      });
    });

    describe('Function: resolveService', () => {
      let injector: Injector;
      beforeEach(() => {
        injector = TestBed.get(Injector);
      });

      test('Should resolve service with default injector', () => {
        const service = resolveService({ modelName: 'TestModel', modelType: TestModel }, injector);
        expect(service).toBeTruthy();
        expect(service).toBeInstanceOf(TestModelService);
      });
    });

    describe('Function: resolveServiceDeep', () => {
      let injector: Injector;
      beforeEach(() => {
        injector = TestBed.get(Injector);
      });

      test('Should resolve service with default injector', () => {
        const service = resolveServiceDeep({ modelName: 'TestModel', modelType: TestModel }, injector, []);
        expect(service).toBeTruthy();
        expect(service).toBeInstanceOf(TestModelService);
      });
    });

    describe('Service: NgrxAutoEntityService', () => {
      describe('load', () => {
        test('should get a valid entityRef on successful load', done => {
          entityService.load(entityInfo, 1234).subscribe(entityRef => {
            expect(entityRef).toEqual({
              info: entityInfo,
              entity: { id: 1234, name: 'Test', parentId: 1, surrogateKey: 'test_1234' }
            });
            done();
          });
        });

        test('should throw an error when the service is not found', done => {
          entityService
            .load(badEntityInfo, 1234)
            .pipe(
              catchError(err => {
                expect(err).toEqual({ info: badEntityInfo, err: { message: 'Service not found' } });
                return of(err);
              })
            )
            .subscribe(() => {
              done();
            });
        });
      });

      describe('loadAll', () => {
        test('should get a valid entityRef on successful load', done => {
          entityService.loadAll(entityInfo).subscribe(entityRef => {
            expect(entityRef).toEqual({
              info: entityInfo,
              entity: [{ id: 1234, name: 'Test', parentId: 1, surrogateKey: 'test_1234' }]
            });
            done();
          });
        });

        test('should throw an error when the service is not found', done => {
          entityService
            .loadAll(badEntityInfo)
            .pipe(
              catchError(err => {
                expect(err).toEqual({ info: badEntityInfo, err: { message: 'Service not found' } });
                return of(err);
              })
            )
            .subscribe(() => {
              done();
            });
        });
      });

      describe('loadPage', () => {
        test('should get a valid entityRef on successful load of filled page', done => {
          entityService.loadPage(entityInfo, { page: 1, size: 1 }).subscribe(entityRef => {
            expect(entityRef).toEqual({
              info: entityInfo,
              pageInfo: { page: { page: 1, size: 1 }, totalCount: 1 },
              entity: [{ id: 1234, name: 'Test', parentId: 1, surrogateKey: 'test_1234' }]
            });
            done();
          });
        });

        test('should get a valid entityRef on successful load of empty page', done => {
          entityService.loadPage(entityInfo, { page: 2, size: 1 }).subscribe(entityRef => {
            expect(entityRef).toEqual({
              info: entityInfo,
              pageInfo: { page: { page: 2, size: 1 }, totalCount: 1 },
              entity: []
            });
            done();
          });
        });

        test('should throw an error when the service is not found', done => {
          entityService
            .loadPage(badEntityInfo, { page: 2, size: 1 })
            .pipe(
              catchError(err => {
                expect(err).toEqual({ info: badEntityInfo, err: { message: 'Service not found' } });
                return of(err);
              })
            )
            .subscribe(() => {
              done();
            });
        });
      });

      describe('loadRange', () => {
        test('should get a valid entityRef on successful load of filled first/last range', done => {
          entityService.loadRange(entityInfo, { first: 1000, last: 2000 }).subscribe(entityRef => {
            expect(entityRef).toEqual({
              info: entityInfo,
              rangeInfo: { range: { first: 1000, last: 2000 }, totalCount: 1 },
              entity: [{ id: 1234, name: 'Test', parentId: 1, surrogateKey: 'test_1234' }]
            });
            done();
          });
        });

        test('should get a valid entityRef on successful load of empty first/last range', done => {
          entityService.loadRange(entityInfo, { start: 0, end: 1000 }).subscribe(entityRef => {
            expect(entityRef).toEqual({
              info: entityInfo,
              rangeInfo: { range: { start: 0, end: 1000 }, totalCount: 1 },
              entity: []
            });
            done();
          });
        });

        test('should get a valid entityRef on successful load of filled start/end range', done => {
          entityService.loadRange(entityInfo, { start: 1000, end: 2000 }).subscribe(entityRef => {
            expect(entityRef).toEqual({
              info: entityInfo,
              rangeInfo: { range: { start: 1000, end: 2000 }, totalCount: 1 },
              entity: [{ id: 1234, name: 'Test', parentId: 1, surrogateKey: 'test_1234' }]
            });
            done();
          });
        });

        test('should get a valid entityRef on successful load of empty start/end range', done => {
          entityService.loadRange(entityInfo, { start: 0, end: 1000 }).subscribe(entityRef => {
            expect(entityRef).toEqual({
              info: entityInfo,
              rangeInfo: { range: { start: 0, end: 1000 }, totalCount: 1 },
              entity: []
            });
            done();
          });
        });

        test('should throw an error when the service is not found', done => {
          entityService
            .loadRange(badEntityInfo, { start: 0, end: 1 })
            .pipe(
              catchError(err => {
                expect(err).toEqual({ info: badEntityInfo, err: { message: 'Service not found' } });
                return of(err);
              })
            )
            .subscribe(() => {
              done();
            });
        });
      });

      describe('create', () => {
        test('should return a valid entityRef on successful create', done => {
          entityService.create(entityInfo, entity).subscribe(entityRef => {
            expect(entityRef).toEqual({ info: entityInfo, entity: { id: 5678, name: 'TestEntity' } });
            done();
          });
        });

        test('should throw an error when the service is not found', done => {
          entityService
            .create(badEntityInfo, entity)
            .pipe(
              catchError(err => {
                expect(err).toEqual({ info: badEntityInfo, err: { message: 'Service not found' } });
                return of(err);
              })
            )
            .subscribe(() => {
              done();
            });
        });
      });

      describe('update', () => {
        test('should return a valid entityRef on successful update', done => {
          entityService.update(entityInfo, entity).subscribe(entityRef => {
            expect(entityRef).toEqual({ info: entityInfo, entity: { id: 5678, name: 'TestEntity' } });
            done();
          });
        });

        test('should throw an error when the service is not found', done => {
          entityService
            .update(badEntityInfo, entity)
            .pipe(
              catchError(err => {
                expect(err).toEqual({ info: badEntityInfo, err: { message: 'Service not found' } });
                return of(err);
              })
            )
            .subscribe(() => {
              done();
            });
        });
      });

      describe('updateMany', () => {
        test('should return a valid entityRef on successful update', done => {
          entityService.updateMany(entityInfo, [entity]).subscribe(entityRef => {
            expect(entityRef).toEqual({ info: entityInfo, entity: [{ id: 5678, name: 'TestEntity' }] });
            done();
          });
        });

        test('should throw an error when the service is not found', done => {
          entityService
            .update(badEntityInfo, entity)
            .pipe(
              catchError(err => {
                expect(err).toEqual({ info: badEntityInfo, err: { message: 'Service not found' } });
                return of(err);
              })
            )
            .subscribe(() => {
              done();
            });
        });
      });

      describe('replace', () => {
        test('should return a valid entityRef on successful replace', done => {
          entityService.replace(entityInfo, entity).subscribe(entityRef => {
            expect(entityRef).toEqual({ info: entityInfo, entity: { id: 5678, name: 'TestEntity' } });
            done();
          });
        });

        test('should throw an error when the service is not found', done => {
          entityService
            .replace(badEntityInfo, entity)
            .pipe(
              catchError(err => {
                expect(err).toEqual({ info: badEntityInfo, err: { message: 'Service not found' } });
                return of(err);
              })
            )
            .subscribe(() => {
              done();
            });
        });
      });

      describe('delete', () => {
        test('should return a valid entityRef on successful delete', done => {
          entityService.delete(entityInfo, entity).subscribe(entityRef => {
            expect(entityRef).toEqual({ info: entityInfo, entity: { id: 5678, name: 'TestEntity' } });
            done();
          });
        });

        test('should throw an error when the service is not found', done => {
          entityService
            .delete(badEntityInfo, entity)
            .pipe(
              catchError(err => {
                expect(err).toEqual({ info: badEntityInfo, err: { message: 'Service not found' } });
                return of(err);
              })
            )
            .subscribe(() => {
              done();
            });
        });
      });
    });
  });
});
