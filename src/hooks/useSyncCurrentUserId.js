import { setCurrentUser } from "../utils/apiCallHandler";

const useSyncCurrentUserId = (user) => {
  const accessToken = user?.access_token || null;
  const userId = user?.profile?.user ?? user?.profile?.sub ?? null;

  setCurrentUser(accessToken, userId);
};

export default useSyncCurrentUserId;
