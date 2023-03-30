import { useLayoutEffect } from "react";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

const LocaleLayout = () => {

  const { locale } = useParams()
  const { i18n } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()

  useLayoutEffect(() => {
    const isValidLocale = i18n.options.locales.includes(locale)

    // Changing language is async.
    async function changeLanguage(locale) {
      await i18n.changeLanguage(locale, (err, t) => {
        if (err) return console.log('something went wrong loading', err);
      })
    }

    if (locale === i18n.language) {
      return
    }
    else if (!isValidLocale) {
      changeLanguage('en')
      const localeRegex = new RegExp(`^/${locale}`)
      navigate(location.pathname.replace(localeRegex, '/en'))
    }
    else {
      changeLanguage(locale)
    }
  }, [locale, i18n, location, navigate])

  return (
    <Outlet />
  )
}

export default LocaleLayout
