import React from 'react'
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom'

import PythonProject from './PythonProject/PythonProject'
import HtmlProject from './HtmlProject/HtmlProject'

const Routes = () => (
  <BrowserRouter>
    <Switch>
     <Route
        exact
        path="/"
        component={PythonProject}
      />
     <Route
        exact
        path="/html"
        component={HtmlProject}
      />
    </Switch>
  </BrowserRouter>
)

export default Routes
