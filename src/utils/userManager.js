import { createUserManager } from "redux-oidc";
import { WebStorageStateStore } from "oidc-client";

const host = `${window.location.protocol}//${window.location.hostname}${
  window.location.port ? `:${window.location.port}` : ""
}`;

const userManagerConfig = {
  client_id: process.env.REACT_APP_AUTHENTICATION_CLIENT_ID,
  redirect_uri: `${host}/auth/callback`,
  post_logout_redirect_uri: host,
  response_type: "code",
  scope: "openid email profile force-consent allow-u13-login roles",
  authority: process.env.REACT_APP_AUTHENTICATION_URL,
  silent_redirect_uri: `${host}/auth/silent_renew`,
  automaticSilentRenew: true,
  filterProtocolClaims: false,
  loadUserInfo: false,
  monitorSession: false,
  userStore: new WebStorageStateStore({ store: window.localStorage }),
  extraQueryParams: {
    brand: "editor",
    login_options: "v1_signup",
  },
};

const userManager = createUserManager(userManagerConfig);

userManager.events.addAccessTokenExpired(() => {
  // If the token has expired, trigger the silent renew process
  userManager.signinSilent();
});

export default userManager;
