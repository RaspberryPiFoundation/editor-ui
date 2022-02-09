import './Button.css';

const Button = (props) => {
  const { className, onClickHandler, buttonText, disabled } = props;

  return (
    <button className={`btn ${className} ${disabled ? "btn--disabled" : ""}`} onClick={onClickHandler}>{buttonText}</button>
  )
};

export default Button;

