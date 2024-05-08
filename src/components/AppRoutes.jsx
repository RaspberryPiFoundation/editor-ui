import React, { lazy, Suspense } from "react";
import { Route, Routes, Navigate, useParams } from "react-router-dom";
import * as Sentry from "@sentry/react";

const Callback = lazy(() =>
  import(/* webpackPrefetch: true */ "../containers/Callback"),
);
const SilentRenew = lazy(() =>
  import(/* webpackPrefetch: true */ "../utils/SilentRenew"),
);
const LocaleLayout = lazy(() =>
  import(/* webpackPrefetch: true */ "./LocaleLayout/LocaleLayout"),
);
const LandingPage = lazy(() =>
  import(/* webpackPrefetch: true */ "./LandingPage/LandingPage"),
);
const ProjectIndex = lazy(() =>
  import(/* webpackPrefetch: true */ "./ProjectIndex/ProjectIndex"),
);
const ProjectComponentLoader = lazy(() =>
  import(/* webpackPrefetch: true */ "../containers/ProjectComponentLoader"),
);
const EmbeddedViewer = lazy(() =>
  import(/* webpackPrefetch: true */ "./EmbeddedViewer/EmbeddedViewer"),
);

const SchoolOnboarding = lazy(() =>
  import(/* webpackPrefetch: true */ "./SchoolOnboarding/SchoolOnboarding"),
);
const SchoolDashboard = lazy(() =>
  import(/* webpackPrefetch: true */ "./School/SchoolDashboard"),
);

const suspense = (comp) => <Suspense fallback={<></>}>{comp}</Suspense>;

const projectLinkRedirects = [
  "/null/projects/:identifier",
  "/projects/:identifier",
];
const localeRedirects = ["/", "/projects"];

const ProjectsRedirect = () => {
  const { identifier } = useParams();
  return <Navigate replace to={`/en/projects/${identifier}`} />;
};

const SentryRoutes = Sentry.withSentryReactRouterV6Routing(Routes);

const AppRoutes = () => (
  <SentryRoutes>
    <Route path="/auth/callback" element={suspense(<Callback />)} />

    <Route path="/auth/silent_renew" element={suspense(<SilentRenew />)} />
    <Route path={":locale"} element={suspense(<LocaleLayout />)}>
      <Route index element={suspense(<LandingPage />)} />
      <Route path={"projects"} element={suspense(<ProjectIndex />)} />
      <Route
        path={"projects/:identifier"}
        element={suspense(<ProjectComponentLoader />)}
      />
      <Route
        path="embed/viewer/:identifier"
        element={suspense(<EmbeddedViewer />)}
      />
      <Route path="schools/new" element={suspense(<SchoolOnboarding />)} />
      <Route
        path="schools/:identifier"
        element={suspense(<SchoolDashboard />)}
      />
    </Route>

    <Route
      path="/embedded/projects/:identifier"
      element={suspense(<ProjectComponentLoader embedded={true} />)}
    />

    {projectLinkRedirects.map((link) => {
      return <Route key={link} path={link} element={<ProjectsRedirect />} />;
    })}

    {localeRedirects.map((link) => {
      return (
        <Route
          key={link}
          path={link}
          element={<Navigate replace to={`/en${link}`} />}
        />
      );
    })}
  </SentryRoutes>
);

export default AppRoutes;
