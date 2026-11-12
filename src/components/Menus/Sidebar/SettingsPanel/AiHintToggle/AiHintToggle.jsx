import { useCookies } from "react-cookie";
import { useTranslation } from "react-i18next";
import { Switch } from "@raspberrypifoundation/design-system-react";

export const AI_HINT_COOKIE = "aiHint";

export const aiHintTurnedOn = (cookies) => cookies[AI_HINT_COOKIE] !== "off";

const AiHintToggle = () => {
  const { t } = useTranslation();
  const [cookies, setCookie] = useCookies([AI_HINT_COOKIE]);

  const handleChange = (e) => {
    setCookie(AI_HINT_COOKIE, e.target.checked ? "on" : "off", { path: "/" });
  };

  return (
    <>
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
    </>
  );
};

export default AiHintToggle;
