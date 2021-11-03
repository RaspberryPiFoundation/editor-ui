import App from './App';
import store from './components/store'
import { Provider } from 'react-redux'
import React from 'react';
import ReactDOM from 'react-dom';

test('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(
    <Provider store={store}>
      <App />
    </Provider>,
    div);
});
