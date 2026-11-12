import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

// Whether AI hints can be offered at all in this editor session. Used both to
// decide whether to show the settings toggle and (with the per-error checks in
// ErrorMessage) whether to show the hint itself.
const useAiHintAvailable = () => {
  const { i18n } = useTranslation();
  const aiErrorsEnabled = useSelector((state) => state.editor.aiErrorsEnabled);
  const friendlyErrorsEnabled = useSelector(
    (state) => state.editor.friendlyErrorsEnabled,
  );
  const accessToken = useSelector((state) => state.auth?.user?.access_token);

  return Boolean(
    aiErrorsEnabled &&
    friendlyErrorsEnabled &&
    accessToken &&
    i18n.language?.startsWith("en"),
  );
};

export default useAiHintAvailable;
