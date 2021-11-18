import { createUserManager } from 'redux-oidc';

const userManagerConfig = {
  client_id: 'editor-dev',
  redirect_uri: 'http://localhost:3000/auth/callback',
  response_type: 'id_token',
  scope: 'openid email profile force-consent roles',
  authority: 'http://localhost:3002',
  silent_redirect_uri: 'htpp://localhost:3000/silent_renew',
  automaticSilentRenew: true,
  filterProtocolClaims: false,
  loadUserInfo: false,
  metadata: {
      issuer: 'http://localhost:3002',
      // userinfo_endpoint: 'https://.../connect/userinfo',
      // jwks_uri: 'https://.../.well-known/openid-configuration/jwks',
      // end_session_endpoint: 'https://.../connect/endsession',
      authorization_endpoint: 'http://localhost:9000/oauth2/auth',
      // token_endpoint: 'http://localhost:9000/oauth2/token',
  }
};

const userManager = createUserManager(userManagerConfig);

export default userManager;
