import React from "react";
import { useEffect } from "react";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

const LocaleLayout = () => {
  const { locale } = useParams();
  const { i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const isValidLocale = i18n.options.locales.includes(locale);

    if (!isValidLocale) {
      const localeRegex = new RegExp(`^/${locale}`);
      navigate(location.pathname.replace(localeRegex, `/${i18n.language}`));
    }
  }, [locale, i18n, location, navigate]);

  return <Outlet />;
};

export default LocaleLayout;
