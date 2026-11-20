import { useSelector } from "react-redux";
import useIsOnline from "./useIsOnline";
import useAiHintAvailable from "./useAiHintAvailable";

const useAiHintOffered = () => {
  const friendlyError = useSelector((state) => state.editor.friendlyError);
  const aiHintsEnabled = useSelector(
    (state) => state.userSettings?.aiHintsEnabled,
  );
  const isOnline = useIsOnline();
  const aiHintAvailable = useAiHintAvailable();

  return Boolean(
    aiHintAvailable && aiHintsEnabled && isOnline && friendlyError?.html,
  );
};

export default useAiHintOffered;
