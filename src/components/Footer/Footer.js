import React from "react";

import rpf_logo from '../../assets/raspberrypi_logo.svg'
import './Footer.scss';

const Footer = () => {
  return (
    <footer className='editor-footer'>
      <div className='editor-footer__foundation'>
        <img src={rpf_logo} alt="Raspberry Pi Logo" />
        <span className='editor-footer__foundation-name'>Raspberry Pi Foundation UK registered charity 1129409</span>
      </div>
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
