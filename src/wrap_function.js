import { pocus } from "./core";

export const fidibus = (func, context) => {
  const out = function() {
    const args = Array.from(arguments);
    if (args.length > 0) {
      return pocus(args, func, context);
    } else {
      return pocus(func, context);
    }
  };
  out.cleanUp = () => {
    pocus(func, context, true);
  };
  return out;
};
