import { hookus } from "./core";
export const useEffect = hookus((data, effect, values) => {
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
      data.cleanUp = effect();
    };
  }
});
