import './Button.css';

const Button = (props) => {
  const { className, onClickHandler, buttonText, disabled } = props;

  var buttonClass="btn"
  buttonClass = (className ? buttonClass += ` ${className}`: buttonClass)
  buttonClass = (disabled ? buttonClass += " btn--disabled" : buttonClass)

  return (
    <button className={buttonClass} onClick={onClickHandler}>{buttonText}</button>
  )
};

export default Button;

