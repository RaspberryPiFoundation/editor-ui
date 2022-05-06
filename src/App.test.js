import App from './App';
import store from './app/store'
import { Provider } from 'react-redux'
import React from 'react';
import { render } from '@testing-library/react';

test('renders without crashing', () => {
  render(
    <Provider store={store}>
      <App />
    </Provider>
    );
});
