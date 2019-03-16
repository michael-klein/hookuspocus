import { useReducer } from "./use_reducer";
import { dataMap } from "./core";

export const on = (hook, cb) => {
  dataMap.set(hook, cb);
};
export const onStateChanged = cb =>
  on(useReducer, (data, reducer, initialArg, init) => {
    const [state, dispatch] = data.hook(data, reducer, initialArg, init);
    return [
      state,
      action => {
        const result = dispatch(action);
        if (state !== result) {
          cb(data.context);
        }
        return result;
      }
    ];
  });
