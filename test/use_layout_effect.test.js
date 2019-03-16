const { useLayoutEffect, pocus } = require("../dist/hookuspocus");

test("useLayoutEffect callbacks run in the right oder", () => {
  let index = 0;
  function test() {
    useLayoutEffect(() => {
      expect(index).toBe(1);
      index++;
      return () => {
        expect(index).toBe(2);
      };
    });
  }
  expect(index).toBe(0);
  index++;
  pocus(test);
});

test("useLayoutEffect does not make pocus async", () => {
  let index = 0;
  function test() {
    useLayoutEffect(() => {
      index++;
    });
  }
  pocus(test);
  pocus(test);
  pocus(test);
  pocus(test);
  pocus(test);
  expect(index).toBe(5);
});

test("useLayoutEffect should skip effects if values don't change", async () => {
  let index = 0;
  function test() {
    useLayoutEffect(() => {
      index++;
      return () => {
        index++;
      };
    }, [1, 2, 3, 4, 5]);
  }
  pocus(test);
  pocus(test);
  pocus(test);
  pocus(test);
  await Promise.resolve();
  expect(index).toBe(1);
});

test("useLayoutEffect should cleanUp last non skipped effect on cleanUp call", async () => {
  let index = 1;
  let cleanUpVal;
  function test() {
    useLayoutEffect(() => {
      index++;
      let cVal = index;
      cleanUpVal = cVal;
      return () => {
        expect(cVal).toBe(cleanUpVal);
      };
    }, [index < 3 ? index : 3]);
  }
  pocus(test);
  pocus(test);
  pocus(test);
  pocus(test);
});
