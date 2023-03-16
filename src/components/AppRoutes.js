import { React } from 'react'
import { Route, Routes, Navigate, useParams } from 'react-router-dom'
import ProjectComponentLoader from './Editor/ProjectComponentLoader/ProjectComponentLoader'
import ProjectIndex from './ProjectIndex/ProjectIndex'
import EmbeddedViewer from './EmbeddedViewer/EmbeddedViewer'
import Callback from './Callback'
import SilentRenew from './SilentRenew'

const projectLinkRedirects = ['/null/projects/:identifier', '/projects/:identifier']
const localeRedirects = ['/', '/projects']

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
    <Route path={"/:locale"} element={<ProjectComponentLoader />} />
    <Route path={"/:locale/projects"} element={<ProjectIndex />} />
    <Route path={"/:locale/projects/:identifier"} element={<ProjectComponentLoader />} />

    <Route
      path="/embedded/projects/:identifier"
      element={<ProjectComponentLoader embedded={true} />}
    />

    <Route
      path="/:locale/embed/viewer/:identifier"
      element={<EmbeddedViewer/>}
    />

    {/* Redirects will be moved into a cloudflare worker. This is just interim */}

    { projectLinkRedirects.map(link => {
      return <Route key={link} path={link} element={<ProjectsRedirect />} />
    }) }

    { localeRedirects.map(link => {
      return <Route key={link} path={link} element={<Navigate replace to={`/en${link}`} />} />
    }) }
  </Routes>
)

export default AppRoutes
