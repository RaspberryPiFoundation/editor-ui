import React from 'react'
import { Route, Routes, Navigate, useParams } from 'react-router-dom'

import ProjectComponentLoader from './Editor/ProjectComponentLoader/ProjectComponentLoader'
import ProjectIndex from './ProjectIndex/ProjectIndex'
import EmbeddedViewer from './EmbeddedViewer/EmbeddedViewer'
import Callback from './Callback'
import SilentRenew from './SilentRenew'

const ProjectsRedirect = () => {
  const { identifier } = useParams();
  return <Navigate replace to={`/en/projects/${identifier}`} />
}

const AppRoutes = () => (
  <Routes>
    <Route
      path="/auth/callback"
      element={<Callback/>}
    />
    <Route
      path="/auth/silent_renew"
      element={<SilentRenew/>}
    />
    <Route
      path="/:locale"
      element={<ProjectComponentLoader/>}
    />
    <Route
      path="/"
      element={<Navigate replace to="/en" />}
    />
    <Route
      path="/:locale/projects"
      element={<ProjectIndex/>}
    />
    <Route
      path="/projects"
      element={<Navigate replace to="/en/projects" />}
    />
    <Route
      path="/:locale/projects/:identifier"
      element={<ProjectComponentLoader/>}
    />
    <Route path="/null/projects/:identifier"
      element={<ProjectsRedirect />}
    />
    <Route path="/projects/:identifier"
      element={<ProjectsRedirect />}
    />
    <Route
      path="/embedded/projects/:identifier"
      element={<ProjectComponentLoader embedded={true} />}
    />
    <Route
      path="/embed/viewer/:identifier"
      element={<EmbeddedViewer/>}
    />
  </Routes>
)

export default AppRoutes
