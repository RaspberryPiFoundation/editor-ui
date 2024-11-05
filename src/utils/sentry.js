import React from "react";
import {
  useLocation,
  useNavigationType,
  createRoutesFromChildren,
  matchRoutes,
} from "react-router-dom";

import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";
import { excludeGraphQLFetch } from "apollo-link-sentry";

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  integrations: [
    new BrowserTracing({
      routingInstrumentation: Sentry.reactRouterV6Instrumentation(
        React.useEffect,
        useLocation,
        useNavigationType,
        createRoutesFromChildren,
        matchRoutes,
      ),
      tracePropagationTargets: [/\//],
    }),
  ],
  environment: process.env.REACT_APP_SENTRY_ENV,
  beforeBreadcrumb: excludeGraphQLFetch,
  tracesSampleRate: 0.8,
});
