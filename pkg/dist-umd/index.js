(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.hookuspocus = {}));
}(this, function (exports) { 'use strict';

  function _newArrowCheck(innerThis, boundThis) {
    if (innerThis !== boundThis) {
      throw new TypeError("Cannot instantiate an arrow function");
    }
  }

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

  var _this = undefined;

  var OUTSIDE_RUN = Symbol("outside_run");
  var currentRun = OUTSIDE_RUN;
  var hookStateMap = new (WeakMap ? WeakMap : Map)();

  var reset = function reset() {
    _newArrowCheck(this, _this);

    currentRun = OUTSIDE_RUN;
  }.bind(undefined);

  var createHookApi = function createHookApi(name) {
    _newArrowCheck(this, _this);

    var hookStates = hookStateMap.get(currentRun.context);

    if (hookStates[currentRun.hookStateIndex] === undefined) {
      hookStates[currentRun.hookStateIndex] = {};
    }

    var hookState = hookStates[currentRun.hookStateIndex];
    var onStateChange = currentRun.onStateChange;
    return {
      onCleanUp: function onCleanUp(callback) {
        hookState.cleanUp = callback;
      },
      beforeNextRun: function beforeNextRun(callback) {
        hookState.beforeNextRun = callback;
      },
      afterCurrentRun: function afterCurrentRun(callback) {
        hookState.afterCurrentRun = callback;
      },
      getContext: function getContext() {
        return currentRun.context;
      },
      getState: function getState(initialState) {
        if (hookState.state === undefined) hookState.state = initialState;
        return hookState.state;
      },
      setState: function setState(value) {
        var silent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
        var oldValue = hookState.state;
        hookState.state = value;
        if (!silent && onStateChange) onStateChange(name, oldValue, value);
      }
    };
  }.bind(undefined);

  var createHook = function createHook(name, hook) {
    var _this2 = this;

    _newArrowCheck(this, _this);

    return function () {
      _newArrowCheck(this, _this2);

      if (currentRun.context === OUTSIDE_RUN) throw new Error("Hook was called outside of run()!");
      currentRun.hookStateIndex++;
      var hookApi = createHookApi(name);

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return hook.apply(void 0, args.concat([hookApi]));
    }.bind(this);
  }.bind(undefined);

  function runLifeCycleCallback(name, hookStates, length) {
    var index = length;

    while (index--) {
      var hookState = hookStates[length - index - 1];

      if (hookState[name]) {
        hookState[name]();
        hookState[name] = undefined;
      }
    }
  }

  var cleanUp = function cleanUp(context) {
    _newArrowCheck(this, _this);

    var hookStates = hookStateMap.get(context);
    runLifeCycleCallback("cleanUp", hookStates, hookStates.length);
  }.bind(undefined);
  var dispose = function dispose(context) {
    _newArrowCheck(this, _this);

    var hookStates = hookStateMap.get(context);
    runLifeCycleCallback("cleanUp", hookStates, hookStates.length);
    hookStateMap.delete(context);
  }.bind(undefined);
  var run = function run(runData) {
    var _runData,
        _this3 = this;

    _newArrowCheck(this, _this);

    if (typeof runData === "function") {
      runData = {
        context: runData,
        function: runData
      };
    }

    if (!(runData.context instanceof Object)) throw new Error("Run was called without a valid object context!");
    currentRun = runData;
    currentRun.hookStateIndex = -1;
    var init = false;

    if (!hookStateMap.has(currentRun.context)) {
      hookStateMap.set(currentRun.context, []);
      init = true;
    }

    var hookStates = hookStateMap.get(currentRun.context);
    var length = hookStates.length;
    runLifeCycleCallback("beforeNextRun", hookStates, length);

    for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
      args[_key2 - 1] = arguments[_key2];
    }

    var result = (_runData = runData).function.apply(_runData, args);

    if (result instanceof Promise) {
      return result.then(function (value) {
        _newArrowCheck(this, _this3);

        runLifeCycleCallback("afterCurrentRun", hookStates, init ? hookStates.length : length);
        reset();
        return value;
      }.bind(this));
    } else {
      runLifeCycleCallback("afterCurrentRun", hookStates, init ? hookStates.length : length);
      reset();
      return result;
    }
  }.bind(undefined);
  var useReducer = createHook("useReducer", function (reducer, initialState, _ref) {
    var _this4 = this;

    var getState = _ref.getState,
        setState = _ref.setState;

    _newArrowCheck(this, _this);

    var state = getState(initialState);
    return [state, function (action) {
      _newArrowCheck(this, _this4);

      setState(reducer(state, action));
    }.bind(this)];
  }.bind(undefined));
  var useState = createHook("useState", function (initialState) {
    var _this5 = this;

    _newArrowCheck(this, _this);

    var _useReducer = useReducer(function (_, action) {
      _newArrowCheck(this, _this5);

      return action.value;
    }.bind(this), initialState),
        _useReducer2 = _slicedToArray(_useReducer, 2),
        state = _useReducer2[0],
        dispatch = _useReducer2[1];

    return [state, function (newState) {
      _newArrowCheck(this, _this5);

      return dispatch({
        type: "set_state",
        value: newState
      });
    }.bind(this)];
  }.bind(undefined));
  var useEffect = createHook("useEffect", function (effect) {
    var _ref2,
        _this6 = this;

    _newArrowCheck(this, _this);

    var valuesIn;

    if ((arguments.length <= 1 ? 0 : arguments.length - 1) > 1) {
      valuesIn = arguments.length <= 1 ? undefined : arguments[1];
    }

    var _ref3 = (_ref2 = (arguments.length <= 1 ? 0 : arguments.length - 1) - 1 + 1, _ref2 < 1 || arguments.length <= _ref2 ? undefined : arguments[_ref2]),
        getState = _ref3.getState,
        setState = _ref3.setState,
        onCleanUp = _ref3.onCleanUp,
        afterCurrentRun = _ref3.afterCurrentRun;

    var _getState = getState({}),
        values = _getState.values,
        cleanUp = _getState.cleanUp;

    var nothingChanged = false;

    if (values !== valuesIn && values && values.length > 0) {
      nothingChanged = true;
      var index = values.length;

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
      afterCurrentRun(function () {
        var _this7 = this;

        _newArrowCheck(this, _this6);

        cleanUp = effect();
        setState({
          values: valuesIn,
          cleanUp: cleanUp
        });

        if (cleanUp) {
          onCleanUp(function () {
            _newArrowCheck(this, _this7);

            cleanUp();
          }.bind(this));
        } else {
          onCleanUp(undefined);
        }
      }.bind(this));
    }
  }.bind(undefined));

  exports.createHook = createHook;
  exports.cleanUp = cleanUp;
  exports.dispose = dispose;
  exports.run = run;
  exports.useReducer = useReducer;
  exports.useState = useState;
  exports.useEffect = useEffect;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
