import React from "react";
import { createRoot } from "react-dom/client";

import { SentryLink } from "apollo-link-sentry";

import "./assets/stylesheets/index.scss";
import "./utils/sentry";
import App from "./App";
import "./utils/i18n";
import {
  ApolloLink,
  ApolloProvider,
  ApolloClient,
  createHttpLink,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { OidcProvider } from "redux-oidc";
import { Provider } from "react-redux";
import store from "./store";
import userManager from "./utils/userManager";
import apolloCache from "./utils/apolloCache";
import { CookiesProvider } from "react-cookie";

const apiEndpointLink = createHttpLink({
  uri: process.env.REACT_APP_API_ENDPOINT + "/graphql",
});
const apiAuthLink = setContext((_, { headers }) => {
  // TODO: ... better way to handle state in Apollo
  const user = store.getState().auth.user;

  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      Authorization: user ? user.access_token : "",
    },
  };
});

const client = new ApolloClient({
  link: ApolloLink.from([new SentryLink(), apiAuthLink, apiEndpointLink]),
  cache: apolloCache,
});

const supportsContainerQueries = "container" in document.documentElement.style;
if (!supportsContainerQueries) {
  // eslint-disable-next-line no-unused-expressions
  import("container-query-polyfill");
}

const div = document.getElementById("root");
const root = createRoot(div);
root.render(
  <CookiesProvider>
    <ApolloProvider client={client}>
      <Provider store={store}>
        <OidcProvider store={store} userManager={userManager}>
          <App />
        </OidcProvider>
      </Provider>
    </ApolloProvider>
  </CookiesProvider>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
