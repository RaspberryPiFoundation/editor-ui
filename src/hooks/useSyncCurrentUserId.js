import { setCurrentUser } from "../utils/apiCallHandler";

// Sync during render, not in an effect: effects run child-before-parent, so a
// descendant's request effect could otherwise fire with a renewed token before
// this ancestor effect updates the association, missing the cache for that load.
const useSyncCurrentUserId = (user) => {
  const accessToken = user?.access_token || null;
  const userId = user?.profile?.sub || user?.profile?.user || null;

  setCurrentUser(accessToken, userId);
};

export default useSyncCurrentUserId;
