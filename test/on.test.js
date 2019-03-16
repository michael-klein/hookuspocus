const {
  on,
  pocus,
  hookus,
  onStateChanged,
  useState
} = require("../dist/hookuspocus");

test("on correctly intercepts hook calls", () => {
  const context = { foo: "bar" };
  const testArg = 5;
  const useTest = hookus((data, arg) => {
    expect(arg).toBe(testArg);
    expect(data.context).toBe(context);
    return arg;
  });
  on(useTest, (data, arg) => {
    return data.hook(data, arg) * 2;
  });
  function test() {
    expect(useTest(testArg)).toBe(testArg * 2);
  }
  pocus(test, context);
});

test("onStateChanged fires when state changed", () => {
  const context = { foo: "bar" };
  const cb = jest.fn();
  onStateChanged(cb);
  function test() {
    const [state, setState] = useState(5);
    setState(6);
  }
  pocus(test, context);
  pocus(test, context);
  pocus(test, context);
  expect(cb).toHaveBeenCalledWith(context);
  expect(cb).toHaveBeenCalledTimes(1);
});
