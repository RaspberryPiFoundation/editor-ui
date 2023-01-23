import React from 'react'
import { Redirect, Route, Switch } from 'react-router-dom'

import ProjectComponentLoader from './Editor/ProjectComponentLoader/ProjectComponentLoader'
import ProjectIndex from './ProjectIndex/ProjectIndex'
import EmbeddedViewer from './EmbeddedViewer/EmbeddedViewer'
import Callback from './Callback'
import SilentRenew from './SilentRenew'

const Routes = () => (
  <Switch>
    <Route
      exact
      path="/auth/callback"
      component={Callback}
    />
    <Route
      exact
      path="/auth/silent_renew"
      component={SilentRenew}
    />
    <Route
      exact
      path="/"
      component={ProjectComponentLoader}
    />
    <Route
      exact
      path="/projects"
      component={ProjectIndex}
    />
    <Route
      exact
      path="/projects/:identifier"
      component={ProjectComponentLoader}
    />
    <Route
      exact
      path="/embedded/projects/:identifier"
      render={(props) => <ProjectComponentLoader {...props} embedded={true} />}
    />
    <Route
      exact
      path="/embed/viewer/:identifier"
      component={EmbeddedViewer}
    />
    <Redirect exact from="/:projectType/:identifier" to="/projects/:identifier" />
    <Redirect exact from="/embedded/:projectType/:identifier" to="/embedded/projects/:identifier" />
  </Switch>
)

export default Routes
