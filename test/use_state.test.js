const { useState, pocus } = require("../dist/hookuspocus");
test("useState returns initialState on first run", () => {
  const initialState = 0;
  function test() {
    const [state] = useState(initialState);
    expect(state).toBe(initialState);
  }
  pocus(test);
});

test("useState does not return initialState on subsequent runs", () => {
  const initialState = 0;
  let passedInitialState = initialState;
  function test() {
    const [state] = useState(passedInitialState);
    expect(state).toBe(initialState);
    passedInitialState++;
  }
  pocus(test);
  pocus(test);
});

test("setState persists stated between runs", () => {
  const testState = 5;
  let index = 0;
  function test() {
    const [state, setState] = useState();

    if (index > 0) {
      expect(state).toBe(testState);
    } else {
      setState(testState);
    }
    index++;
  }
  pocus(test);
  pocus(test);
});
