import { useSelector } from "react-redux";
import { useCookies } from "react-cookie";
import useIsOnline from "./useIsOnline";
import useAiHintAvailable from "./useAiHintAvailable";
import { AI_HINT_COOKIE, aiHintTurnedOn } from "../utils/aiHintCookie";

const useAiHintOffered = () => {
  const friendlyError = useSelector((state) => state.editor.friendlyError);
  const isOnline = useIsOnline();
  const aiHintAvailable = useAiHintAvailable();
  const [cookies] = useCookies([AI_HINT_COOKIE]);

  return Boolean(
    aiHintAvailable &&
    aiHintTurnedOn(cookies) &&
    isOnline &&
    friendlyError?.html,
  );
};

export default useAiHintOffered;
