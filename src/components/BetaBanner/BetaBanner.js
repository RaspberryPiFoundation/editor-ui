import React from "react";
import { useCookies } from "react-cookie";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { CloseIcon } from "../../Icons";
import Button from "../Button/Button";
import { showBetaModal } from "../Editor/EditorSlice";

import './BetaBanner.scss'

const BetaBanner = () => {

  const dispatch = useDispatch()
  const { t } = useTranslation()
  const [cookies, setCookie] = useCookies(['betaBannerDismissed'])

  const closeBanner = () => {
    setCookie('betaBannerDismissed', 'true')
  }
  const showModal = () => { dispatch(showBetaModal()) }
  const isShowing = !cookies.betaBannerDismissed

  return (
    isShowing ? 
      (<div className='editor-banner editor-banner--beta'>
        <span className = 'editor-banner--beta__icon'>Beta</span>
        <span className='editor-banner__message'>
          {t('betaBanner.message')}
          <Button className='btn--tertiary editor-banner__link' buttonText={t('betaBanner.modalLink')} onClickHandler={showModal}/>
        </span>
        <Button className = 'btn--tertiary editor-banner__close-button' ButtonIcon={CloseIcon} onClickHandler={closeBanner} />
      </div>)
    : <></>
  )
}

export default BetaBanner
