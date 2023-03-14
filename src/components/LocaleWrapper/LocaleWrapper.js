import { useEffect, useLayoutEffect } from "react";
import { useParams } from "react-router-dom";
import i18n from 'i18next';

const LocaleWrapper = ({ children }) => {

  const { locale } = useParams()

  useLayoutEffect(() => {
    if (locale !== i18n.language) {
      i18n.changeLanguage(locale, (err, t) => {
        if (err) return console.log('something went wrong loading', err);
        t('key'); // -> same as i18next.t
      });
    }
  }, [locale])

  return children
}

export default LocaleWrapper
