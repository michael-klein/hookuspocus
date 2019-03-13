let hookIndex;
let stackIndex;
const hookDataStack = [];
const dataMap = new (WeakMap || Map)();
export const on = (hook, cb) => {
  dataMap.set(hook, cb);
};
export const hookus = hookFunction => {
  return function hook() {
    const context = hookDataStack[stackIndex][0];
    hookIndex++;
    const data =
      hookDataStack[stackIndex][hookIndex] ||
      (hookDataStack[stackIndex][hookIndex] = [
        { context, hook: hookFunction }
      ]);
    return (dataMap.get(hook) || hookFunction).apply(
      {},
      data.concat(Array.from(arguments))
    );
  };
};
const runLifeCycles = name => {
  hookDataStack[stackIndex].forEach(data => {
    if (data[0] && data[0][name]) {
      data[0][name]();
      delete data[0][name];
    }
  });
};
export const pocus = function() {
  const args = Array.from(arguments);
  let funcArgs;
  if (args[0]["pop"]) {
    funcArgs = args.shift();
  }
  const context = typeof args[1] === "boolean" ? args[0] : args[1] || args[0];
  const cleanUp = args[1] === true || args[2];
  hookIndex = 0;
  stackIndex = hookDataStack.push(dataMap.get(context) || [context]) - 1;
  dataMap.set(context, hookDataStack[stackIndex]);
  let result;
  if (cleanUp === true) {
    runLifeCycles("cleanUp");
    dataMap.delete(context);
  } else {
    runLifeCycles("before");
    result = args[0].apply(args[0], funcArgs);
    runLifeCycles("after");
  }
  hookDataStack.pop();
  return result;
};
