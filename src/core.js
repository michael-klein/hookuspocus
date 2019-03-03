let index;
let hookData;
let dataMap = new (WeakMap || Map)();
export const on = (hook, cb) => {
  dataMap.set(hook, cb);
};
export const hookus = hookFunction => {
  return function hook() {
    const context = hookData[0];
    index++;
    const data =
      hookData[index] || (hookData[index] = [{ context, hook: hookFunction }]);
    return (dataMap.get(hook) || hookFunction).apply(
      {},
      data.concat(Array.from(arguments))
    );
  };
};
const runLifeCycles = name => {
  hookData.forEach(data => {
    if (data[0] && data[0][name]) {
      data[0][name]();
      delete data[0][name];
    }
  });
};
export const pocus = (func, arg1, arg2) => {
  index = 0;
  const context = typeof arg1 === "boolean" ? func : arg1 || func;
  const cleanUp = arg1 === true || arg2;
  dataMap.set(context, (hookData = dataMap.get(context) || [context]));
  let result;
  if (cleanUp === true) {
    runLifeCycles("cleanUp");
    dataMap.delete(context);
  } else {
    runLifeCycles("before");
    result = func();
    runLifeCycles("after");
  }
  hookData = null;
  return result;
};
