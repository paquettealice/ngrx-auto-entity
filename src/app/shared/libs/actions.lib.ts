import { TypedAction, ActionCreator } from '@ngrx/store/src/models';
import { ICorrelatedAction } from 'dist/ngrx-auto-entity/lib/actions';
import uuidv4 from 'uuidv4';

export function createCorrelatedAction<T extends string, P extends object>(
  type: T,
  config: { _as: "props"; _p: P; }
): ActionCreator<T, (props: P) => P & TypedAction<T> & ICorrelatedAction> {
  return Object.defineProperty((props: P): P & TypedAction<T> & ICorrelatedAction => {
    return {
      ...props,
      type,
      correlationId: uuidv4()
    };
  }, 'type', { value: type, writable: false })
}