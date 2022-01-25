import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import './cookie_banner.css';
import App from './App';
// import reportWebVitals from './reportWebVitals';

import { OidcProvider, loadUser } from 'redux-oidc';
import { Provider } from 'react-redux'
import store from './app/store'
import userManager from './utils/userManager'

loadUser(store, userManager);

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <OidcProvider store={store} userManager={userManager}>
        <App />
      </OidcProvider>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
