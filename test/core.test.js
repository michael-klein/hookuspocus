const { hookus, pocus, on } = require("../dist/hookuspocus");

// use cases already covered be the useState tests will not be covered again here
test("pocus passes function arguments if supplied as first arg", () => {
  const arg = "test";
  function test(argIn) {
    expect(argIn).toBe(arg);
  }
  pocus([arg], test);
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

test("on correctly intercepts hook calls", () => {
  const returnValue = 2;
  const useTest = hookus(_ => {
    return 1;
  });
  on(useTest, () => returnValue);
  function test() {
    expect(useTest()).toBe(returnValue);
  }
  pocus(test);
});
