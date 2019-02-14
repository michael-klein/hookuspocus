<p align="center">
  <img width="400px" src="https://i.imgur.com/zLWcMlv.png" alt="hookus pokus logo">
</p>
<p align="center">
  <b>Add hooks to all the functions!<img src="https://img.shields.io/npm/v/hookuspocus.svg"></b>
</p>
<br><br>
This is a small JavaScript library that will allow you to add hooks ([https://reactjs.org/docs/hooks-intro.html) to any function.

It provides the basic hooks from which you can build more complex hooks:

- useReducer
- useState
- useEffect

For a bigger example of this library at work, see my other project: [funcyjs](https://github.com/michael-klein/funcy.js)

## How it works

### How to enable hooks on functions

#### Wrapping functions

```javascript
import { html, render } from "https://unpkg.com/htm?module";
import { hookuspocus, useState } from "https://unpkg.com/hookuspocus/dist-web/index.js";
const renderApp = hookuspocus(
  () => {
    const [count, setCount] = useState(0);
    render(
      html`
        <div>
          <div>Count:${count}</div>
          <button onClick=${() => setCount(count + 1)}>increment</button>
        </div>
      `,
      document.getElementById("app")
    );
  },
  {
    onValueChange: (name, value, oldValue) => {
      if (name === "useReducer" && value !== oldValue)
        requestAnimationFrame(renderApp);
    }
    // context: <some Object>
  }
);
renderApp();
```

If you just want to make a function able to be able to support hooks, wrap it with _hookuspocus_. The first argument is the function to be wrapped, the second is a config object.

_onValueChange_ is a callback which is called whenever a _base hook_ changes the state value associated with it. It will be passed the name of the hook, the current and old value. This is useful to for instance queue re-renders of render functions (see above) when state (useReducer) changes.

You may also supply a context object, which should be unique to the wrapped function. If you omit this option, the function itself will serve as context. More on that in the next section.

Additionally, wrapped functions also expose two methods:

```javascript
renderApp.cleanUp(); // triggers cleanUp of useEffects
renderApp.dispose(); // triggers cleanUp and disposed the wrapped function
```

#### Usage without wrapping

```javascript
import { html, render } from "https://unpkg.com/htm?module";
import { hookuspocus, useState } from "https://unpkg.com/hookuspocus/dist-web/index.js";
const context = {
  some: "context"
};
hookus(context, (name, value, oldValue) => {
  if (name === "useReducer" && value !== oldValue)
    requestAnimationFrame(renderApp);
});
const renderApp = () =>
  pocus(context, () => {
    const [count, setCount] = useState(0);
    render(
      html`
        <div>
          <div>Count:${count}</div>
          <button onClick=${() => setCount(count + 1)}>increment</button>
        </div>
      `,
      document.getElementById("app")
    );
  });
renderApp();
```

The above example demonstrates how to use hooks without wrapping a function. _hookus_ is used to register a context and onValueChange callback. You can then run any function within that context with hooks using _pocus_. Any arguments passed to pocus after the first to will be passed on to the function.

_Note:_ You shouldn't use functions with differing implementations with the same context. Since hooks rely on call order, this will invitable fail.

### Context & Async execution

Central to hookuspocus is the concept of _context_. A context is an object that is unique to individual execution contexts of functions and allow hookuspocus to associate hook state to them. As long as you call pocus with the same context on the same (implementation wise) function, hook state will persist betweeen runs.

Functions you want to use with hookuspocus can be async. You should, however, make sure that you do not overlap execution of hooked up functions. You can not run another function with pocus while you await the result of another.

## Hooks

### Types

hookuspocus differentiates between _base hooks_ and just _hooks_. Hooks are just methods that allow you to perform stateful operations and effects within functions contexts, as described in the react docs.

_Base hooks_ are no different, but they hook directly into the underlying runtime through api methods supplied by hookuspocus. They can utilize certain lifecycle methods and most notably, directly retrieve and set state values (without using useReducer/useState).

useReducer and useEffect are base hooks that come with hookuspocus.

### How to create base hooks

Normal hooks can be created just by composing other hooks in functions. That's how useState is actually implemented:

```javascript
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
```

_base hooks_ however a created using _createHook_ like this:

```javascript
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
```

All base hooks have a string label associated with them (as identifier in onValueChange) and a function, which represents the actual hook logic. When the hook is is called, it will be passed a hookApi object as first parameter, followed by whatever arguments were passed into the hook from the execution context.

the _hookApi_ has the following signature:

```typescript
interface HookApi {
  // these three methods allow you to register callbacks for lifecycle methods
  onCleanUp(callback: () => void): void; // this is fired when cleanUp() or dispose() are called. Use it to clean to remove event listeners, etv.
  afterCurrentRun(callback: () => void): void; // fired after the current pocus run is done (including awaiting promises). Think useEffect
  beforeNextRun(callback: () => void): void; // fired before the next pocus run. Think useEffect cleanup

  getContext(): Object; // the current execution context objwct
  getValue(initialValue: any): any; // return the current value for this hook call. Set to value to intialValue on initialize
  setValue(value: any, silent?: boolean): void; // set current hook value. Fires onValueChange unless silent is true
}
```

### License

MIT License

Copyright (c) 2019 Michael Klein

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
