import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useCookies } from "react-cookie";
import { useTranslation } from "react-i18next";
import { Switch } from "@raspberrypifoundation/design-system-react";
import { clearAiHintToggleFocusRequest } from "../../../../../redux/EditorSlice";

export const AI_HINT_COOKIE = "aiHint";

export const aiHintTurnedOn = (cookies) => cookies[AI_HINT_COOKIE] !== "off";

const AiHintToggle = () => {
  const { t } = useTranslation();
  const [cookies, setCookie] = useCookies([AI_HINT_COOKIE]);
  const dispatch = useDispatch();
  const focusRequested = useSelector(
    (state) => state.editor.aiHintToggleFocusRequested,
  );
  const containerRef = useRef(null);

  useEffect(() => {
    if (!focusRequested) return;
    containerRef.current?.querySelector("#ai_hint_toggle")?.focus();
    dispatch(clearAiHintToggleFocusRequest());
  }, [focusRequested, dispatch]);

  const handleChange = (e) => {
    setCookie(AI_HINT_COOKIE, e.target.checked ? "on" : "off", { path: "/" });
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
        checked={aiHintTurnedOn(cookies)}
        onChange={handleChange}
      />
      <p id="ai_hint_toggle_description">
        {t("sidebar.settingsMenu.aiHintDescription")}
      </p>
    </div>
  );
};

export default AiHintToggle;
