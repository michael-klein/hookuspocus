const { hookus, pocus, on, useState } = require("../dist/hookuspocus");

// use cases already covered be the useState tests will not be covered again here
test("pocus passes function arguments if supplied as first arg", () => {
  const arg = "test";
  function test(argIn) {
    expect(argIn).toBe(arg);
  }
  pocus([arg], test);
});

test("nested pocus runs don't fail", () => {
  const test1State = 1;
  const test2State = 2;
  function test2() {
    const [state] = useState(test2State);
    expect(state).toBe(test2State);
  }
  function test1() {
    const [state] = useState(test1State);
    expect(state).toBe(test1State);
  }
  pocus(test1);
  pocus(test1);
  pocus(test1);
});

test("hooks defined with hokus can be used in pocus and are passed arguments", () => {
  const arg = "test";
  const useTest = hookus((data, argIn) => {
    expect(argIn).toBe(arg);
  });
  function test() {
    useTest(arg);
  }
  pocus(test);
});

test("data.context should contain correct context in hooks defineed with hookus", () => {
  let context;
  const useTest = hookus(data => {
    expect(data.context).toBe(context);
  });
  function test() {
    useTest();
  }
  context = test;
  pocus(test);
  context = { foo: "bar" };
  pocus(test, context);
});
