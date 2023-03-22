import { useLayoutEffect } from "react";
import { Navigate, Outlet, useLocation, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

const LocaleLayout = () => {

  const { locale } = useParams()
  const { i18n } = useTranslation()
  const location = useLocation()

  const isValidLocale = i18n.options.locales.includes(locale)

  useLayoutEffect(() => {
    if (isValidLocale && locale !== i18n.language) {
      i18n.changeLanguage(locale, (err, t) => {
        if (err) return console.log('something went wrong loading', err);
        t('key'); // -> same as i18next.t
      });
    }
  }, [locale, i18n])

  const localeRegex = new RegExp(`^/${locale}`)
  
  return isValidLocale ? <Outlet /> : <Navigate to={location.pathname.replace(localeRegex, '/en')} replace />
}

export default LocaleLayout
