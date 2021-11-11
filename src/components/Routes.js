import React from 'react'
import { BrowserRouter, Route, Switch } from 'react-router-dom'

import ProjectComponentLoader from './Editor/ProjectComponentLoader/ProjectComponentLoader'

const Routes = () => (
  <BrowserRouter>
    <Switch>
     <Route
        exact
        path="/"
        component={ProjectComponentLoader}
      />
     <Route
        exact
        path="/:projectType"
        component={ProjectComponentLoader}
      />
    </Switch>
  </BrowserRouter>
)

export default Routes
