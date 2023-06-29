import React from "react";
import { useCookies } from "react-cookie";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { CloseIcon } from "../../Icons";
import { Link } from "react-router-dom";
import Button from "../Button/Button";
import { ExternalLinkIcon } from "../../Icons";
import { showBetaModal } from "../Editor/EditorSlice";

import "./BetaBanner.scss";

const BetaBanner = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [cookies, setCookie] = useCookies(["betaBannerDismissed"]);

  const closeBanner = () => {
    setCookie("betaBannerDismissed", "true", { path: "/" });
  };
  const showModal = () => {
    dispatch(showBetaModal());
  };
  const isShowing = !cookies.betaBannerDismissed;

  const handleKeyDown = (e) => {
    const enterKey = 13;
    const spaceKey = 32;
    if (e.keyCode === enterKey || e.keyCode === spaceKey) {
      e.preventDefault();
      showModal();
    }
  };

  return isShowing ? (
    <div className="editor-banner editor-banner--beta">
      <span className="editor-banner--beta__icon">Beta</span>
      <span className="editor-banner__message">
        {t("betaBanner.message")}
        <span
          className="btn btn--tertiary editor-banner__link"
          onClick={showModal}
          tabIndex={0}
          role="button"
          onKeyDown={handleKeyDown}
        >
          {t("betaBanner.modalLink")}
        </span>
      </span>
      <span>{t("betaBanner.feedbackText")}</span>
      <Link
        className="btn btn--tertiary editor-banner__link"
        to="https://form.raspberrypi.org/f/code-editor-feedback"
      >
        {
          <>
            <span className="class">{t("betaBanner.feedback")}</span>
            <ExternalLinkIcon />
          </>
        }
      </Link>
      <span>{t("betaBanner.feedbackImprove")}</span>
      <Button
        className="btn--tertiary editor-banner__close-button"
        label={t("betaBanner.buttonLabel")}
        title={t("betaBanner.buttonLabel")}
        ButtonIcon={CloseIcon}
        onClickHandler={closeBanner}
      />
    </div>
  ) : (
    <></>
  );
};

export default BetaBanner;
