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
