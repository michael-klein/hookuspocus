import { hookus } from "./core";
export const useLayoutEffect = hookus((data, effect, values) => {
  if (
    !data.v ||
    (values &&
      !(
        values.length === data.v.length &&
        values.every(value => ~data.v.indexOf(value))
      ))
  ) {
    data.v = values;
    if (data.cleanUp) {
      data.cleanUp();
    }
    data.after = () => {
      let result = effect();
      if (result instanceof Promise) {
        result = result.then(cleanUp => (data.cleanUp = cleanUp));
      } else {
        data.cleanUp = result;
      }
      return result;
    };
  }
});
