const { fidibus, useState, hookus } = require("../dist/hookuspocus");

test("fidibus returns a function", () => {
  const wrapped = fidibus(() => undefined);
  expect(typeof wrapped).toBe("function");
});

test("function wrapped with fidibus runs correctly over multiple runs", () => {
  let index = 0;
  const wrapped = fidibus(() => {
    const [state, setState] = useState(0);
    expect(state).toBe(index);
    index++;
    setState(index);
  });
  wrapped();
  wrapped();
  wrapped();
  wrapped();
});
test("function wrapped with fidibus should be passed argument", () => {
  const arg1 = "test";
  const arg2 = "test2";
  const arg3 = "test3";
  const wrapped = fidibus((arg1In, arg2In, arg3In) => {
    expect(arg1).toBe(arg1In);
    expect(arg2).toBe(arg2In);
    expect(arg3).toBe(arg3In);
  });
  wrapped(arg1, arg2, arg3);
});
test("hooks in function wrapped with fidibus should be passed context", () => {
  const context = { foo: "bar" };
  const useTest = hookus(data => {
    expect(data.context).toBe(context);
  });
  const wrapped = fidibus(() => {
    useTest();
  }, context);
  wrapped();
});
