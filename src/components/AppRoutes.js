import { React } from "react";
import { Route, Routes, Navigate, useParams } from "react-router-dom";
import * as Sentry from "@sentry/react";

import ProjectComponentLoader from "./Editor/ProjectComponentLoader/ProjectComponentLoader";
import ProjectIndex from "./ProjectIndex/ProjectIndex";
import EmbeddedViewer from "./EmbeddedViewer/EmbeddedViewer";
import Callback from "./Callback";
import SilentRenew from "./SilentRenew";
import LocaleLayout from "./LocaleLayout/LocaleLayout";

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
    <Route path="/auth/callback" element={<Callback />} />

    <Route path="/auth/silent_renew" element={<SilentRenew />} />
    <Route path={":locale"} element={<LocaleLayout />}>
      <Route index element={<ProjectComponentLoader />} />
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
  </SentryRoutes>
);

export default AppRoutes;
