"use strict";
const contextMap = new (WeakMap ? WeakMap : Map)();
let currentContext;
const createHookApi = (name, contextMapEntry) => {
  const hookState = contextMapEntry.hookStates[contextMapEntry.hookStateIndex];
  return {
    onCleanUp(callback) {
      hookState.cleanUp = callback;
    },
    beforeNextRun(callback) {
      hookState.beforeNextRun = callback;
    },
    afterCurrentRun(callback) {
      hookState.afterCurrentRun = callback;
    },
    getContext() {
      return currentContext;
    },
    getValue(initialValue) {
      if (hookState.value === undefined) hookState.value = initialValue;
      return hookState.value;
    },
    setValue(value, silent = false) {
      let oldValue = hookState.value;
      hookState.value = value;
      if (!silent && contextMapEntry.onValueChange)
        contextMapEntry.onValueChange(name, value, oldValue);
    }
  };
};
export const createHook = (name, hook) => {
  return (...args) => {
    if (currentContext === undefined)
      throw new Error("Hook was called outside of run()!");
    const contextMapEntry = contextMap.get(currentContext);
    contextMapEntry.hookStateIndex++;
    if (
      contextMapEntry.hookStates[contextMapEntry.hookStateIndex] === undefined
    ) {
      contextMapEntry.hookStates[contextMapEntry.hookStateIndex] = {
        value: undefined
      };
      contextMapEntry.hookStates[
        contextMapEntry.hookStateIndex
      ].hookApi = createHookApi(name, contextMapEntry);
    }
    return hook(
      contextMapEntry.hookStates[contextMapEntry.hookStateIndex].hookApi,
      ...args
    );
  };
};

function runLifeCycleCallback(name, hookStates) {
  for (const hookState of hookStates) {
    if (hookState[name]) {
      hookState[name]();
      hookState[name] = undefined;
    }
  }
}
export const hookus = (context, onValueChange) => {
  if (!(context instanceof Object))
    throw new Error("Context must be an object!");
  contextMap.set(context, {
    hookStates: [],
    hookStateIndex: -1,
    onValueChange
  });
};
export const cleanUp = context => {
  const contextMapEntry = contextMap.get(context);
  runLifeCycleCallback("cleanUp", contextMapEntry.hookStates);
};
export const dispose = context => {
  const contextMapEntry = contextMap.get(context);
  runLifeCycleCallback("cleanUp", contextMapEntry.hookStates);
  contextMapEntry.hookStates.length = 0;
  contextMapEntry.delete(context);
};
export const pocus = (context, func, ...args) => {
  if (currentContext !== undefined)
    throw new Error("Tried to start a run before the end of the previous run!");
  if (!contextMap.has(context))
    throw new Error("Tried to start a run without a registered context!");
  currentContext = context;
  const contextMapEntry = contextMap.get(currentContext);
  contextMapEntry.hookStateIndex = -1;
  runLifeCycleCallback("beforeNextRun", contextMapEntry.hookStates);
  const result = func(...args);
  const finish = value => {
    runLifeCycleCallback("afterCurrentRun", contextMapEntry.hookStates);
    currentContext = undefined;
    return value;
  };
  if (result instanceof Promise) {
    return result.then(finish);
  } else {
    return finish(result);
  }
};
export const hookuspocus = (func, { context, onValueChange }) => {
  if (context === undefined) context = func;
  hookus(context, onValueChange);
  const runTime = function(...args) {
    return pocus(context, func, ...args);
  };
  runTime.dispose = () => {
    dispose(context);
    context = undefined;
    func = undefined;
  };
  runTime.cleanUp = () => cleanUp(context);
  return runTime;
};
export const useReducer = createHook(
  "useReducer",
  ({ getValue, setValue }, reducer, initialState) => {
    const state = getValue(initialState);
    return [
      state,
      action => {
        setValue(reducer(state, action));
      }
    ];
  }
);
export const useState = initialState => {
  const [state, dispatch] = useReducer((_, action) => {
    return action.value;
  }, initialState);
  return [
    state,
    newState =>
      dispatch({
        type: "set_state",
        value: newState
      })
  ];
};

export const useEffect = createHook(
  "useEffect",
  ({ getValue, setValue, onCleanUp, afterCurrentRun }, effect, valuesIn) => {
    let { values, cleanUp } = getValue({});
    let nothingChanged = false;
    if (values !== valuesIn && values && values.length > 0) {
      nothingChanged = true;
      let index = values.length;

      while (index--) {
        if (valuesIn[index] !== values[index]) {
          nothingChanged = false;
          break;
        }
      }
      values = valuesIn;
    }
    if (!nothingChanged) {
      if (cleanUp) cleanUp();
      afterCurrentRun(() => {
        cleanUp = effect();
        if (typeof cleanUp !== "function") cleanUp = undefined;
        setValue({ values: valuesIn, cleanUp });
        if (cleanUp) {
          onCleanUp(() => {
            cleanUp();
          });
        } else {
          onCleanUp(undefined);
        }
      });
    }
  }
);
