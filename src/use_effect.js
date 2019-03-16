import { useLayoutEffect } from "./use_layout_effect";

export const useEffect = (effect, values) => {
  useLayoutEffect(
    () => new Promise(resolve => requestAnimationFrame(_ => resolve(effect()))),
    values
  );
};
