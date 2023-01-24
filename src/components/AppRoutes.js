import React from 'react'
import { Route, Routes } from 'react-router-dom'

import ProjectComponentLoader from './Editor/ProjectComponentLoader/ProjectComponentLoader'
import ProjectIndex from './ProjectIndex/ProjectIndex'
import EmbeddedViewer from './EmbeddedViewer/EmbeddedViewer'
import Callback from './Callback'
import SilentRenew from './SilentRenew'

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
      path="/"
      element={<ProjectComponentLoader/>}
    />
    <Route
      path="/projects"
      element={<ProjectIndex/>}
    />
    {/* <Route
      path="/:projectType"
      element={<ProjectComponentLoader/>}
    /> */}
    <Route
      path="/projects/:identifier"
      element={<ProjectComponentLoader/>}
    />
    <Route
      path="/embedded/:projectType/:identifier"
      element={<ProjectComponentLoader embedded={true} />}
    />
    <Route
      path="/embed/viewer/:identifier"
      element={<EmbeddedViewer/>}
    />
  </Routes>
)

export default AppRoutes
