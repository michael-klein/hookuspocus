import { hookus } from "./core";

export const useReducer = hookus((data, reducer, initialArg, init) => {
  data.s = data.s !== undefined ? data.s : init ? init(initialArg) : initialArg;
  return [
    data.s,
    action => {
      data.s = reducer(data.s, action);
      return data.s;
    }
  ];
});
