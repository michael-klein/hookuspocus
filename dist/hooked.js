(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.hooked = {}));
}(this, function (exports) { 'use strict';

  const OUTSIDE_RUN = Symbol("outside_run");
  let currentHookStateIndex;
  let currentRun = OUTSIDE_RUN;
  const hookStateMap = new (WeakMap ? WeakMap : Map)();
  const reset = () => {
    currentRun = OUTSIDE_RUN;
  };
  const createHookApi = name => {
    const hookStates = hookStateMap.get(currentRun.context);
    if (hookStates[currentHookStateIndex] === undefined) {
      hookStates[currentHookStateIndex] = {};
    }
    const hookState = hookStates[currentHookStateIndex];
    const onStateChange = currentRun.onStateChange;
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
      getApi() {
        return currentRun.api;
      },
      getContext() {
        return currentRun.context;
      },
      getState(initialState) {
        if (hookState.state === undefined) hookState.state = initialState;
        return hookState.state;
      },
      setState(value, silent = false) {
        let oldValue = hookState.state;
        hookState.state = value;
        if (!silent && onStateChange) onStateChange(name, oldValue, value);
      }
    };
  };
  const createHook = (name, hook) => {
    return (...args) => {
      if (currentRun.context === OUTSIDE_RUN)
        throw new Error("Hook was called outside of run()!");
      currentHookStateIndex++;
      const hookApi = createHookApi(name);
      return hook(...args, hookApi);
    };
  };
  function runLifeCycleCallback(name, hookStates, length) {
    let index = length;
    while (index--) {
      const hookState = hookStates[length - index - 1];
      if (hookState[name]) {
        hookState[name]();
        hookState[name] = undefined;
      }
    }
  }
  const run = (
    callback,
    { context, api, onStateChange = () => {} } = {}
  ) => {
    if (!context) context = callback;
    if (!(context instanceof Object))
      throw new Error("Run was called without a valid object context!");
    if (currentRun !== OUTSIDE_RUN)
      throw new Error("Run was called before the end of the previous run!");
    currentRun = {
      context,
      api,
      onStateChange
    };
    currentHookStateIndex = -1;
    let init = false;
    if (!hookStateMap.has(context)) {
      hookStateMap.set(context, []);
      init = true;
    }
    const hookStates = hookStateMap.get(currentRun.context);
    const length = hookStates.length;
    runLifeCycleCallback("beforeNextRun", hookStates, length);
    const result = callback();
    if (result instanceof Promise) {
      return result.then(value => {
        runLifeCycleCallback(
          "afterCurrentRun",
          hookStates,
          init ? hookStates.length : length
        );
        reset();
        return value;
      });
    } else {
      runLifeCycleCallback(
        "afterCurrentRun",
        hookStates,
        init ? hookStates.length : length
      );
      reset();
      return result;
    }
  };
  const useReducer = createHook(
    "useReducer",
    (reducer, initialState, { getState, setState }) => {
      const state = getState(initialState);
      return [
        state,
        action => {
          setState(reducer(state, action));
        }
      ];
    }
  );
  const useState = createHook("useState", initialState => {
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
  });

  const useEffect = createHook("useEffect", (effect, ...rest) => {
    let valuesIn;
    if (rest.length > 1) {
      valuesIn = rest[0];
    }
    const { getState, setState, onCleanUp, afterCurrentRun } = rest[
      rest.length - 1
    ];
    let { values, cleanUp } = getState({});
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
        setState({ values: valuesIn, cleanUp });
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

  exports.createHook = createHook;
  exports.run = run;
  exports.useReducer = useReducer;
  exports.useState = useState;
  exports.useEffect = useEffect;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=hooked.js.map
