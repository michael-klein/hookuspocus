<p align="center">
  <img src="https://i.imgur.com/G3AHpOs.png" width="250px" alt="hookus pokus logo">
</p>
<p align="center">
  <b>Add hooks to all the functions!</b>
</p>
<p align="center">
  <a href="https://www.npmjs.com/package/hookuspocus" target="_blank"><img src="https://img.shields.io/npm/v/hookuspocus.svg"></a> <a href="https://travis-ci.org/michael-klein/hookuspocus" target="_blank"><img src="https://travis-ci.org/michael-klein/hookuspocus.svg?branch=master"></a>
</p>
<br><br>

This is a small JavaScript library that will allow you to add [hooks](https://reactjs.org/docs/hooks-intro.html) to any function. I clocks in at less than ```700B``` minified and gzipped.

It provides the basic hooks from which you can build more complex hooks:

- useReducer
- useState
- useEffect

# Basic usage

if you don't know what they are yet, please learn about hooks from the [react docs](https://reactjs.org/docs/hooks-intro.html) before you continue.

In order to enhance any function with hooks, you need to call it through `pocus`:

```javascript
import { pocus, useState } from "hookuspocus";
function withHooks() {
  const [count, setCount] = useState(0);
  console.log(`function called ${count} times`);
  setCount(count + 1);
}
pocus(withHooks); // function called 0 times
pocus(withHooks); // function called 1 times
pocus(withHooks); // function called 2 times
```

It's important that the function you pass each pocus run is the same object every time (because we use it as key to store hook state across runs). If you can't guarantee this, you may pass a `context object` as second argument to connect subsequent runs:

```javascript
import { pocus, useState } from "hookuspocus";
const context = { foo: "bar" };
function withHooks() {
  const [count, setCount] = useState(0);
  console.log(`function called ${count} times`);
  setCount(count + 1);
}
pocus(withHooks, context); // function called 0 times
pocus(withHooks, context); // function called 1 times
pocus(withHooks, context); // function called 2 times
```

You can also pass `arguments` to the wrapped function call by supplying them in an array as the first argument:

```javascript
import { pocus } from "hookuspocus";
function withHooks(arg1, arg2) {
  console.log(`${arg1} ${arg2}!`); // Hello world!
}
pocus(["Hello", "world"], withHooks);
```

Internally, hookuspocus uses WeakMaps if possible to keep states between runs (and falls back to simple Maps). If yourtarget browsers don't all have support for WeakMaps or you need to trigger cleanUp logic (e.g.: from useEffect) after a final run, you can call pocus with `true` as the last argument. This will call all remaining cleanUp functions and remove the function/context from the map:

```javascript
import { pocus, useEffect } from "hookuspocus";
function withHooks() {
  useEffect(() => {
    //some effect here
    return () => {
      //something that needs cleaning up here
    };
  });
}
pocus(withHooks); //run it
pocus(withHooks, true); //clean up
```
hookuspocus also exports a helper function called `fidibus` that allows you to wrap a function (and context) and returns a new function you can just call repeatadly, for ease of use:

```javascript
import { fidibus } from "hookuspocus";
const wrapped = fidibus((arg1, arg2) => {
  const [count, setCount] = useState(1);
  console.log(`${arg1} ${arg2} #${count}!`);
  setCount(count + 1);
});
wrapped("hello", "world"); // Hello world #1!
wrapped("hello", "world"); // Hello world #2!
wrapped("hello", "world"); // Hello world #3!
```

The wrapped function also has a `cleanUp` method attached to it:

```javascript
wrapped.cleanUp(); // runs cleanUp logic
```

# Creating hooks

There are two way to create hooks for use with hookuspocus:

1. By composing new hooks from existing hooks. Hooks created in this manner from other frameworks like react should just work with hookuspocus (as long as they don't rely on built in hooks that are not provided by hookuspocus).

The useState hook is actually example of a hook created this way:

```javascript
import { useReducer } from "./use_reducer";

export const useState = initialState => {
  const [state, dispatch] = useReducer(
    (_, action) => action.value,
    initialState
  );
  return [
    state,
    newState =>
      dispatch({
        value: newState
      })
  ];
};
```

2. By creating new base hooks that use features provided by hookuspocus. This is accomplished with the `hookus` method. Let's look at the useEffect hook as an example:

```javascript
import { hookus } from "./core";
export const useEffect = hookus((data, effect, values) => {
  if (
    !data.v ||
    (values &&
      !(
        values.length === data.v.length &&
        values.every(value => ~data.v.indexOf(value))
      ))
  ) {
    data.v = values;
    if (data.cleanUp) {
      data.cleanUp();
    }
    data.after = () => {
      data.cleanUp = effect();
    };
  }
});
```

`hookus` takes a function which represents the implementation of the hook and returns a hook function. Whenever this hook is called, the wrapped function will be called with a data object followed by whatever arguments where passed to the wrapper. 

The data object is the means by which hooks can interact with the hookuspocus api and persist data between pocus calls. You can add any property to the data object for the latter purpose (in the above example data.v is used to store the values array passed as second argument to useEffect).

The data object also accepts 3 function properties: `before`, `after` and `cleanup`. Methods that are passed to these will be called before the next hook call, after the current pocus run or respectively when cleanUp is initiated.

useEffect uses data.after to execute effects after pocus runs and will manually call cleanUp before applying new effects if neccessary.

### License

MIT License

Copyright (c) 2019 Michael Klein

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
