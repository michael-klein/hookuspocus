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

  var contextMap = new (WeakMap ? WeakMap : Map)();
  var currentContext;

  var createHookApi = function createHookApi(name, contextMapEntry) {
    _newArrowCheck(this, _this);

    var hookState = contextMapEntry.hookStates[contextMapEntry.hookStateIndex];
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
        return currentContext;
      },
      getValue: function getValue(initialValue) {
        if (hookState.value === undefined) hookState.value = initialValue;
        return hookState.value;
      },
      setValue: function setValue(value) {
        var silent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
        var oldValue = hookState.value;
        hookState.value = value;
        if (!silent && contextMapEntry.onValueChange) contextMapEntry.onValueChange(name, value, oldValue);
      }
    };
  }.bind(undefined);

  var createHook = function createHook(name, hook) {
    var _this2 = this;

    _newArrowCheck(this, _this);

    return function () {
      _newArrowCheck(this, _this2);

      if (currentContext === undefined) throw new Error("Hook was called outside of run()!");
      var contextMapEntry = contextMap.get(currentContext);
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

      return hook.apply(void 0, [contextMapEntry.hookStates[contextMapEntry.hookStateIndex].hookApi].concat(args));
    }.bind(this);
  }.bind(undefined);

  function runLifeCycleCallback(name, hookStates) {
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = hookStates[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var hookState = _step.value;

        if (hookState[name]) {
          hookState[name]();
          hookState[name] = undefined;
        }
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return != null) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  }

  var hookus = function hookus(context, onValueChange) {
    _newArrowCheck(this, _this);

    if (!(context instanceof Object)) throw new Error("Context must be an object!");
    contextMap.set(context, {
      hookStates: [],
      hookStateIndex: -1,
      onValueChange: onValueChange
    });
  }.bind(undefined);
  var cleanUp = function cleanUp(context) {
    _newArrowCheck(this, _this);

    var contextMapEntry = contextMap.get(context);
    runLifeCycleCallback("cleanUp", contextMapEntry.hookStates);
  }.bind(undefined);
  var dispose = function dispose(context) {
    _newArrowCheck(this, _this);

    var contextMapEntry = contextMap.get(context);
    runLifeCycleCallback("cleanUp", contextMapEntry.hookStates);
    contextMapEntry.hookStates.length = 0;
    contextMapEntry.delete(context);
  }.bind(undefined);
  var pocus = function pocus(context, func) {
    var _this3 = this;

    _newArrowCheck(this, _this);

    if (currentContext !== undefined) throw new Error("Tried to start a run before the end of the previous run!");
    if (!contextMap.has(context)) throw new Error("Tried to start a run without a registered context!");
    currentContext = context;
    var contextMapEntry = contextMap.get(currentContext);
    contextMapEntry.hookStateIndex = -1;
    runLifeCycleCallback("beforeNextRun", contextMapEntry.hookStates);

    for (var _len2 = arguments.length, args = new Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
      args[_key2 - 2] = arguments[_key2];
    }

    var result = func.apply(void 0, args);

    var finish = function finish(value) {
      _newArrowCheck(this, _this3);

      runLifeCycleCallback("afterCurrentRun", contextMapEntry.hookStates);
      currentContext = undefined;
      return value;
    }.bind(this);

    if (result instanceof Promise) {
      return result.then(finish);
    } else {
      return finish(result);
    }
  }.bind(undefined);
  var hookuspocus = function hookuspocus(func, _ref) {
    var _this4 = this;

    var context = _ref.context,
        onValueChange = _ref.onValueChange;

    _newArrowCheck(this, _this);

    if (context === undefined) context = func;
    hookus(context, onValueChange);

    var runTime = function runTime() {
      for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
      }

      return pocus.apply(void 0, [context, func].concat(args));
    };

    runTime.dispose = function () {
      _newArrowCheck(this, _this4);

      dispose(context);
      context = undefined;
      func = undefined;
    }.bind(this);

    runTime.cleanUp = function () {
      _newArrowCheck(this, _this4);

      return cleanUp(context);
    }.bind(this);

    return runTime;
  }.bind(undefined);
  var useReducer = createHook("useReducer", function (_ref2, reducer, initialState) {
    var _this5 = this;

    var getValue = _ref2.getValue,
        setValue = _ref2.setValue;

    _newArrowCheck(this, _this);

    var state = getValue(initialState);
    return [state, function (action) {
      _newArrowCheck(this, _this5);

      setValue(reducer(state, action));
    }.bind(this)];
  }.bind(undefined));
  var useState = function useState(initialState) {
    var _this6 = this;

    _newArrowCheck(this, _this);

    var _useReducer = useReducer(function (_, action) {
      _newArrowCheck(this, _this6);

      return action.value;
    }.bind(this), initialState),
        _useReducer2 = _slicedToArray(_useReducer, 2),
        state = _useReducer2[0],
        dispatch = _useReducer2[1];

    return [state, function (newState) {
      _newArrowCheck(this, _this6);

      return dispatch({
        type: "set_state",
        value: newState
      });
    }.bind(this)];
  }.bind(undefined);
  var useEffect = createHook("useEffect", function (_ref3, effect, valuesIn) {
    var _this7 = this;

    var getValue = _ref3.getValue,
        setValue = _ref3.setValue,
        onCleanUp = _ref3.onCleanUp,
        afterCurrentRun = _ref3.afterCurrentRun;

    _newArrowCheck(this, _this);

    var _getValue = getValue({}),
        values = _getValue.values,
        cleanUp = _getValue.cleanUp;

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
        var _this8 = this;

        _newArrowCheck(this, _this7);

        cleanUp = effect();
        setValue({
          values: valuesIn,
          cleanUp: cleanUp
        });

        if (cleanUp) {
          onCleanUp(function () {
            _newArrowCheck(this, _this8);

            cleanUp();
          }.bind(this));
        } else {
          onCleanUp(undefined);
        }
      }.bind(this));
    }
  }.bind(undefined));

  exports.createHook = createHook;
  exports.hookus = hookus;
  exports.cleanUp = cleanUp;
  exports.dispose = dispose;
  exports.pocus = pocus;
  exports.hookuspocus = hookuspocus;
  exports.useReducer = useReducer;
  exports.useState = useState;
  exports.useEffect = useEffect;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
