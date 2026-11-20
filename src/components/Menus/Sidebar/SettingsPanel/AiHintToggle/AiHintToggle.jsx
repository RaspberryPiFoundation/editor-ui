import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Trans, useTranslation } from "react-i18next";
import { Switch } from "@raspberrypifoundation/design-system-react";
import { clearAiHintToggleFocusRequest } from "../../../../../redux/EditorSlice";
import { aiHintLinkComponents } from "../../../../../utils/aiHintLinks";
import { useUpdateUserSettings } from "../../../../../hooks/useUserSettings";
import { aiHintToggledEvent } from "../../../../../events/WebComponentCustomEvents";

const AiHintToggle = () => {
  const { t } = useTranslation();
  const aiHintsEnabled = useSelector(
    (state) => state.userSettings.aiHintsEnabled,
  );
  const updateSettings = useUpdateUserSettings();
  const dispatch = useDispatch();
  const focusRequested = useSelector(
    (state) => state.editor.aiHintToggleFocusRequested,
  );
  const projectIdentifier = useSelector(
    (state) => state.editor.project?.identifier,
  );
  const containerRef = useRef(null);

  useEffect(() => {
    if (!focusRequested) return;
    containerRef.current?.querySelector("#ai_hint_toggle")?.focus();
    dispatch(clearAiHintToggleFocusRequest());
  }, [focusRequested, dispatch]);

  const handleChange = (e) => {
    const enabled = e.target.checked;
    updateSettings({ aiHintsEnabled: enabled });
    document.dispatchEvent(aiHintToggledEvent({ projectIdentifier, enabled }));
  };

  return (
    <div ref={containerRef}>
      <Switch
        id="ai_hint_toggle"
        name="aiHintToggle"
        label={t("sidebar.settingsMenu.aiHint")}
        icon
        reverse
        fullWidth
        aria-describedby="ai_hint_toggle_description"
        checked={aiHintsEnabled}
        onChange={handleChange}
      />
      <p id="ai_hint_toggle_description">
        <Trans
          i18nKey="sidebar.settingsMenu.aiHintDescription"
          components={aiHintLinkComponents}
        />
      </p>
    </div>
  );
};

export default AiHintToggle;
