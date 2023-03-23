import { useEffect } from "react";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

const LocaleLayout = () => {

  const { locale } = useParams()
  const { i18n } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const isValidLocale = i18n.options.locales.includes(locale)

    if (!isValidLocale) {
      const localeRegex = new RegExp(`^/${locale}`)
      navigate(location.pathname.replace(localeRegex, '/en'))
    }
    else if (locale !== i18n.language) {
      i18n.changeLanguage(locale, (err, t) => {
        if (err) return console.log('something went wrong loading', err);
        t('key'); // -> same as i18next.t
      })
    }
  }, [locale, i18n, location, navigate])
  
  return (
    <Outlet />
  )
}

export default LocaleLayout
