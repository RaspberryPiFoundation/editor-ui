import { React, lazy, Suspense } from "react";
import { Route, Routes, Navigate, useParams } from "react-router-dom";
import * as Sentry from "@sentry/react";

const Callback = lazy(() => import(/* webpackPrefetch: true */ "./Callback"));
const SilentRenew = lazy(() =>
  import(/* webpackPrefetch: true */ "./SilentRenew"),
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
  import(
    /* webpackPrefetch: true */ "./Editor/ProjectComponentLoader/ProjectComponentLoader"
  ),
);
const EmbeddedViewer = lazy(() =>
  import(/* webpackPrefetch: true */ "./EmbeddedViewer/EmbeddedViewer"),
);

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
    <Suspense fallback={<></>}>
      <Route path="/auth/callback" element={<Callback />} />

      <Route path="/auth/silent_renew" element={<SilentRenew />} />
      <Route path={":locale"} element={<LocaleLayout />}>
        <Route index element={<LandingPage />} />
        <Route path={"projects"} element={<ProjectIndex />} />
        <Route
          path={"projects/:identifier"}
          element={<ProjectComponentLoader />}
        />
        <Route path="embed/viewer/:identifier" element={<EmbeddedViewer />} />
      </Route>

      <Route
        path="/embedded/projects/:identifier"
        element={<ProjectComponentLoader embedded={true} />}
      />

      {/* Redirects will be moved into a cloudflare worker. This is just interim */}

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
    </Suspense>
  </SentryRoutes>
);

export default AppRoutes;
