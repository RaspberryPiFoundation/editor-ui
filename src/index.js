import React from 'react';
import { createRoot } from 'react-dom/client';
import * as Sentry from '@sentry/react'
import { BrowserTracing } from '@sentry/tracing';
import './index.css';
import App from './App';

import { OidcProvider } from 'redux-oidc';
import { Provider } from 'react-redux'
import store from './app/store'
import userManager from './utils/userManager'
import { CookiesProvider } from 'react-cookie';

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  integrations: [new BrowserTracing()],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
})

const div = document.getElementById('root')
const root = createRoot(div)
root.render(
  <React.StrictMode>
    <CookiesProvider>
      <Provider store={store}>
        <OidcProvider store={store} userManager={userManager}>
          <App />
        </OidcProvider>
      </Provider>
    </CookiesProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
