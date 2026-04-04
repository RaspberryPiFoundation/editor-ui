import React from "react";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "../redux/RootSlice";

const renderWithProviders = (
  ui,
  { preloadedState, store, reducer = rootReducer, ...renderOptions } = {},
) => {
  const testStore = store || configureStore({ reducer, preloadedState });

  const Wrapper = ({ children }) => (
    <Provider store={testStore}>{children}</Provider>
  );

  return {
    store: testStore,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
};

export default renderWithProviders;
