const { useReducer, pocus } = require("../dist/hookuspocus");

// use cases already covered be the useState tests will not be covered again here
const noop = () => undefined;
test("useReducer uses the init function if present", () => {
  const initialState = 1;
  function test() {
    const [state] = useReducer(
      noop,
      initialState,
      initialState => initialState * 2
    );
    expect(state).toBe(initialState * 2);
  }
  pocus(test);
});
