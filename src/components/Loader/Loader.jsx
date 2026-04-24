import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";

const DEFAULT_LOADER_DELAY = 250;

const Loader = ({ display = true, delay = DEFAULT_LOADER_DELAY }) => {
  const [ready, setReady] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    if (!display) {
      setReady(false);
      return;
    }

    setReady(false);
    const timer = setTimeout(() => {
      setReady(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [display, delay]);

  return (
    <>
      {display && ready ? (
        <div
          className="loader"
          data-testid="loader"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          <span>{t("webComponent.loading")}</span>
        </div>
      ) : null}
    </>
  );
};

Loader.propTypes = {
  display: PropTypes.bool,
  delay: PropTypes.number,
};

export default Loader;
