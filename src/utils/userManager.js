import { createUserManager } from 'redux-oidc';

const userManagerConfig = {
  client_id: 'editor-dev',
  redirect_uri: 'http://localhost:3000/auth/callback',
  response_type: 'code',
  scope: 'openid email profile force-consent',
  authority: 'http://localhost:9000',
  silent_redirect_uri: 'htpp://localhost:3000/silent_renew',
  automaticSilentRenew: true,
  filterProtocolClaims: false,
  loadUserInfo: false,
  metadata: {
      // issuer: 'http://localhost:3002',
      // userinfo_endpoint: 'https://.../connect/userinfo',
      // jwks_uri: 'https://.../.well-known/openid-configuration/jwks',
      // end_session_endpoint: 'https://.../connect/endsession',
      authorization_endpoint: 'http://localhost:9000/oauth2/token',
      token_endpoint: 'http://localhost:9000/oauth2/token',
  }
};

const userManager = createUserManager(userManagerConfig);

export default userManager;
