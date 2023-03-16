import { useLayoutEffect } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

const LocaleWrapper = ({ children }) => {

  const { locale } = useParams()
  const { i18n } = useTranslation()

  useLayoutEffect(() => {
    if (locale !== i18n.language) {
      i18n.changeLanguage(locale, (err, t) => {
        if (err) return console.log('something went wrong loading', err);
        t('key'); // -> same as i18next.t
      });
    }
  }, [locale, i18n])

  return children
}

export default LocaleWrapper
