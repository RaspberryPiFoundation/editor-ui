import './Button.css';

const Button = (props) => {
  const { onClickHandler, buttonText, leftAlign, disabled } = props;

  return (
    <button className={`btn ${leftAlign ? "btn--left-align" : "" } ${disabled ? "btn--disabled" : ""}`} onClick={onClickHandler}>{buttonText}</button>
  )
};

export default Button;

