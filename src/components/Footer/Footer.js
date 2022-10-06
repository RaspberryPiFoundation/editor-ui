import React from "react";
import './Footer.scss';

const Footer = () => {
  return (
    <footer className='editor-footer'>
      <span className='editor-footer__name'>Raspberry Pi Foundation UK registered charity 1129409</span>
      <div className='editor-footer__links'>
        <a className='editor-footer__links-link' href='https://www.raspberrypi.org/privacy'>Privacy</a>
        <a className='editor-footer__links-link' href='https://www.raspberrypi.org/cookies'>Cookies</a>
        <a className='editor-footer__links-link' href='https://www.raspberrypi.org/accessibility'>Accessibility</a>
        <a className='editor-footer__links-link' href='https://www.raspberrypi.org/safeguarding'>Safeguarding</a>
      </div>
    </footer>
  )
}

export default Footer;
