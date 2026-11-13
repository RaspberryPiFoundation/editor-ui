import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

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
