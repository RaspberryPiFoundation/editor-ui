import React from "react";
import { useTranslation } from "react-i18next";
import './Footer.scss';

const Footer = () => {
  const { t } = useTranslation()
  return (
    <footer className='editor-footer'>
      <span className='editor-footer__name'>{t('footer.charityNameAndNumber')}</span>
      <div className='editor-footer__links'>
        <a className='editor-footer__links-link' href='https://www.raspberrypi.org/privacy/child-friendly'>{t('footer.privacy')}</a>
        <a className='editor-footer__links-link' href='https://www.raspberrypi.org/cookies'>{t('footer.cookies')}</a>
        <a className='editor-footer__links-link' href='https://www.raspberrypi.org/accessibility'>{t('footer.accessibility')}</a>
        <a className='editor-footer__links-link' href='https://www.raspberrypi.org/safeguarding'>{t('footer.safeguarding')}</a>
      </div>
    </footer>
  )
}

export default Footer;
