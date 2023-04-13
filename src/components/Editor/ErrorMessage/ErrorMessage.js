import React, {useContext} from 'react'
import './ErrorMessage.scss'
import {useDispatch, useSelector} from 'react-redux'
import {SettingsContext} from '../../../settings';
import Button from "../../Button/Button";
import {QuestionMarkIcon} from "../../../Icons";
import {showChatGPTModal, } from "../EditorSlice";


const ErrorMessage = () => {
    const error = useSelector((state) => state.editor.error);
    const settings = useContext(SettingsContext);
    const dispatch = useDispatch();

    const handleClick = () => {
        dispatch(showChatGPTModal())
    }

    return error ? (
        <div className={`error-message error-message--${settings.fontSize}`}>
            <p className='error-message__content'>
                {error}
                <Button className='btn--tertiary'
                        label='kittens'
                        title='What does this mean?'
                        ButtonIcon={QuestionMarkIcon}
                        onClickHandler={handleClick}/>
            </p>

        </div>
    ) : null;
};

export default ErrorMessage;
