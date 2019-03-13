const hookuspocus = require("../dist/hookuspocus");

// use cases already covered be the useState tests will not be covered again here
test("index exports are correct", () => {
  const exportKeys = [
    "fidibus",
    "hookus",
    "pocus",
    "on",
    "useEffect",
    "useReducer",
    "useState"
  ];
  const keys = Object.keys(hookuspocus);
  expect(keys.length).toBe(exportKeys.length);
  expect(exportKeys.every(key => key.indexOf(keys) > 1));
});
