function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _iterableToArrayLimit(arr, i) {
  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = undefined;

  try {
    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance");
}

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

    setValue(value) {
      let silent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      let oldValue = hookState.value;
      hookState.value = value;
      if (!silent && contextMapEntry.onValueChange) contextMapEntry.onValueChange(name, value, oldValue);
    }

  };
};

const createHook = (name, hook) => {
  return function () {
    if (currentContext === undefined) throw new Error("Hook was called outside of run()!");
    const contextMapEntry = contextMap.get(currentContext);
    contextMapEntry.hookStateIndex++;

    if (contextMapEntry.hookStates[contextMapEntry.hookStateIndex] === undefined) {
      contextMapEntry.hookStates[contextMapEntry.hookStateIndex] = {
        value: undefined
      };
      contextMapEntry.hookStates[contextMapEntry.hookStateIndex].hookApi = createHookApi(name, contextMapEntry);
    }

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return hook(contextMapEntry.hookStates[contextMapEntry.hookStateIndex].hookApi, ...args);
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

const hookus = (context, onValueChange) => {
  if (!(context instanceof Object)) throw new Error("Context must be an object!");
  contextMap.set(context, {
    hookStates: [],
    hookStateIndex: -1,
    onValueChange
  });
};
const cleanUp = context => {
  const contextMapEntry = contextMap.get(context);
  runLifeCycleCallback("cleanUp", contextMapEntry.hookStates);
};
const dispose = context => {
  const contextMapEntry = contextMap.get(context);
  runLifeCycleCallback("cleanUp", contextMapEntry.hookStates);
  contextMapEntry.hookStates.length = 0;
  contextMapEntry.delete(context);
};
const pocus = function pocus(context, func) {
  if (currentContext !== undefined) throw new Error("Tried to start a run before the end of the previous run!");
  if (!contextMap.has(context)) throw new Error("Tried to start a run without a registered context!");
  currentContext = context;
  const contextMapEntry = contextMap.get(currentContext);
  contextMapEntry.hookStateIndex = -1;
  runLifeCycleCallback("beforeNextRun", contextMapEntry.hookStates);

  for (var _len2 = arguments.length, args = new Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
    args[_key2 - 2] = arguments[_key2];
  }

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
const hookuspocus = (func, _ref) => {
  let context = _ref.context,
      onValueChange = _ref.onValueChange;
  if (context === undefined) context = func;
  hookus(context, onValueChange);

  const runTime = function runTime() {
    for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      args[_key3] = arguments[_key3];
    }

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
const useReducer = createHook("useReducer", (_ref2, reducer, initialState) => {
  let getValue = _ref2.getValue,
      setValue = _ref2.setValue;
  const state = getValue(initialState);
  return [state, action => {
    setValue(reducer(state, action));
  }];
});
const useState = initialState => {
  const _useReducer = useReducer((_, action) => {
    return action.value;
  }, initialState),
        _useReducer2 = _slicedToArray(_useReducer, 2),
        state = _useReducer2[0],
        dispatch = _useReducer2[1];

  return [state, newState => dispatch({
    type: "set_state",
    value: newState
  })];
};
const useEffect = createHook("useEffect", (_ref3, effect, valuesIn) => {
  let getValue = _ref3.getValue,
      setValue = _ref3.setValue,
      onCleanUp = _ref3.onCleanUp,
      afterCurrentRun = _ref3.afterCurrentRun;

  let _getValue = getValue({}),
      values = _getValue.values,
      cleanUp = _getValue.cleanUp;

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
      setValue({
        values: valuesIn,
        cleanUp
      });

      if (cleanUp) {
        onCleanUp(() => {
          cleanUp();
        });
      } else {
        onCleanUp(undefined);
      }
    });
  }
});

export { createHook, hookus, cleanUp, dispose, pocus, hookuspocus, useReducer, useState, useEffect };
