import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Button } from "@raspberrypifoundation/design-system-react";
import "../../../assets/stylesheets/AiErrorMessage.scss?inline";
import { useTranslation } from "react-i18next";
import BadgeQuestionMarkIcon from "../../../assets/icons/badge_question_mark.svg";

const HINTS = [
  "Your code uses the variable kittens, but this hasn't been created yet. Check line 2 in main.py. If you meant to print the text kittens, put it in double quotes.",
  "Lorem ipsum dolor sit amet consectetur. Et sed metus arcu quis lectus. Mauris fringilla interdum vel vivamus et sociis risus nunc in. At a nunc id pellentesque amet at porttitor. Turpis leo aenean pulvinar nam enim aenean. Montes dictum augue eget fringilla quam.  ",
  "Do you need more coffee? Probably.",
];

const TYPING_SPEED_MS = 10;

const AiErrorMessage = () => {
  const aiErrorsEnabled = useSelector((state) => state.editor.aiErrorsEnabled);
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [hint, setHint] = useState("");
  const [typedLength, setTypedLength] = useState(0);
  const typingDone = typedLength >= hint.length;

  const handleButtonClick = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setHint(HINTS[Math.floor(Math.random() * HINTS.length)]);
      setTypedLength(0);
      setShowHint(true);
    }, 1000);
  };

  useEffect(() => {
    if (!showHint) return;
    const interval = setInterval(() => {
      setTypedLength((length) => {
        if (length >= hint.length) {
          clearInterval(interval);
          return length;
        }
        return length + 1;
      });
    }, TYPING_SPEED_MS);
    return () => clearInterval(interval);
  }, [showHint, hint]);

  useEffect(() => {
    if (!showHint || !typingDone) return;
    const timeout = setTimeout(() => setShowHint(false), 3000);
    return () => clearTimeout(timeout);
  }, [showHint, typingDone]);

  return aiErrorsEnabled ? (
    <div className="ai-error-message">
      {showHint ? (
        <div className="ai-error-message__hint">
          <p className="ai-error-message__hint-heading">
            <BadgeQuestionMarkIcon />
            {t("output.aiErrorMessages.aiGeneratedHint")}
          </p>
          <p className="ai-error-message__hint-text">
            {hint.slice(0, typedLength)}
          </p>
        </div>
      ) : (
        <Button
          className="ai-error-message__button"
          loading={loading}
          loadingText={t("output.aiErrorMessages.loadingText")}
          fullWidth={true}
          onClick={handleButtonClick}
          type="secondary"
          text={t("output.aiErrorMessages.buttonText")}
        />
      )}
    </div>
  ) : null;
};

export default AiErrorMessage;
