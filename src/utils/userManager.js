import { createUserManager } from 'redux-oidc';

const userManagerConfig = {
  client_id: 'editor-dev',
  client_secret: 'secret',
  redirect_uri: 'http://localhost:3000/auth/callback',
  response_type: 'code',
  scope: 'openid email profile force-consent',
  authority: 'http://localhost:9000',
  silent_redirect_uri: 'htpp://localhost:3000/silent_renew',
  automaticSilentRenew: true,
  filterProtocolClaims: false,
  loadUserInfo: false,
  monitorSession: false,
};

const userManager = createUserManager(userManagerConfig);

export default userManager;
