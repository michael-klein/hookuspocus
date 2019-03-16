let hookIndex;
let stackIndex;
const hookDataStack = [];
export const dataMap = new (WeakMap || Map)();
const runMap = new (WeakMap || Map)();
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
const runLifeCycles = (context, name) => {
  const promises = hookDataStack[stackIndex]
    .map(data => {
      if (data[0] && data[0][name]) {
        const result = data[0][name]();
        data[0][name] = 0;
        return result;
      }
    })
    .filter(result => result instanceof Promise);
  if (promises.length > 0) {
    const promiseAll = Promise.all(promises);
    runMap.set(
      context,
      runMap.has(context) ? runMap.get(context).then(promiseAll) : promiseAll
    );
  }
};
const waitForContext = (context, cb) => {
  if (runMap.has(context)) {
    const promise = runMap.get(context).then(cb);
    runMap.set(context, promise);
    return promise;
  } else {
    return cb();
  }
};
const run = (context, cleanUp, func, args) => {
  if (cleanUp === true) {
    runMap.set(context, runLifeCycles(context, "cleanUp"));
    dataMap.delete(context);
  } else {
    return waitForContext(context, () => {
      hookIndex = 0;
      stackIndex = hookDataStack.push(dataMap.get(context) || [context]) - 1;
      dataMap.set(context, hookDataStack[stackIndex]);
      runLifeCycles(context, "before");
      return waitForContext(context, () => {
        let result = func.apply(func, args);
        runLifeCycles(context, "after");
        return waitForContext(context, () => {
          hookDataStack.pop();
          runMap.delete(context);
          return result;
        });
      });
    });
  }
};
export const pocus = function() {
  const args = Array.from(arguments);
  let funcArgs;
  if (args[0]["pop"]) {
    funcArgs = args.shift();
  }
  const context = typeof args[1] === "boolean" ? args[0] : args[1] || args[0];
  const cleanUp = args[1] === true || args[2];
  return run(context, cleanUp, args[0], funcArgs);
};
