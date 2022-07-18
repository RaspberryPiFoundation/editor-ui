import React from 'react'
import { Route, Switch } from 'react-router-dom'

import ProjectComponentLoader from './Editor/ProjectComponentLoader/ProjectComponentLoader'
import NewProject from './NewProject/NewProject'
import ProjectIndex from './ProjectIndex/ProjectIndex'
import ProjectViewer from './ProjectViewer/ProjectViewer'
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
      path="/new"
      component={NewProject}
    />
    <Route
      exact
      path="/projects"
      component={ProjectIndex}
    />
    <Route
      exact
      path="/:projectType"
      component={ProjectComponentLoader}
    />
    <Route
      exact
      path="/:projectType/:identifier"
      component={ProjectComponentLoader}
    />
    <Route
      exact
      path="/embedded/:projectType/:identifier"
      render={(props) => <ProjectComponentLoader {...props} embedded={true} />}
    />
    <Route
      exact
      path="/python/share/:identifier"
      component={ProjectViewer}
    />
    <Route
      exact
      path="/embed/viewer/:identifier"
      component={EmbeddedViewer}
    />
  </Switch>
)

export default Routes
