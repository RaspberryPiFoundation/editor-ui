import React from 'react';
import { createRoot } from 'react-dom/client';
import * as Sentry from '@sentry/react'
import { BrowserTracing } from '@sentry/tracing';
import './index.css';
import App from './App';
import './i18n';
import { ApolloProvider, ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { OidcProvider } from 'redux-oidc';
import { Provider } from 'react-redux';
import store from './app/store';
import userManager from './utils/userManager';
import apolloCache from './utils/apolloCache';
import { CookiesProvider } from 'react-cookie';

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  integrations: [new BrowserTracing({tracingOrigins: ["*"]})],
  debug: true,
  environment: process.env.REACT_APP_SENTRY_ENV,

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
})

const apiEndpointLink = createHttpLink({ uri: process.env.REACT_APP_API_ENDPOINT + '/graphql' });
const apiAuthLink = setContext((_, { headers }) => {
  // TODO: ... better way to handle state in Apollo
  const user = store.getState().auth.user;

  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      Authorization: user ? user.access_token : "",
    }
  }
});

const client = new ApolloClient({ link: apiAuthLink.concat(apiEndpointLink), cache: apolloCache});

const div = document.getElementById('root')
const root = createRoot(div)
root.render(
  <React.StrictMode>
    <CookiesProvider>
      <ApolloProvider client={client}>
        <Provider store={store}>
          <OidcProvider store={store} userManager={userManager}>
            <App />
          </OidcProvider>
        </Provider>
      </ApolloProvider>
    </CookiesProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
