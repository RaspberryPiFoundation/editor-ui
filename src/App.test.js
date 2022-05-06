import App from './App';
import store from './app/store'
import { Provider } from 'react-redux'
import React from 'react';
import {createRoot} from 'react-dom/client';

test('renders without crashing', () => {
  const div = document.createElement('div');
  const root = createRoot(div)
  root.render(
    <Provider store={store}>
      <App />
    </Provider>,
    div);
});
