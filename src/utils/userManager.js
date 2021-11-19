import { createUserManager } from 'redux-oidc';

const host = `${window.location.protocol}//${window.location.hostname}${
  window.location.port ? `:${window.location.port}` : ''
}`

const userManagerConfig = {
  client_id: process.env.REACT_APP_AUTHENTICATION_CLIENT_ID,
  redirect_uri: `${host}/auth/callback`,
  response_type: 'code',
  scope: 'openid email profile force-consent',
  authority: process.env.REACT_APP_AUTHENTICATION_URL,
  silent_redirect_uri: `${host}/silent_renew`,
  automaticSilentRenew: true,
  filterProtocolClaims: false,
  loadUserInfo: false,
  monitorSession: false,
};

const userManager = createUserManager(userManagerConfig);

export default userManager;
