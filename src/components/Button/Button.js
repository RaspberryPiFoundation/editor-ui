import './Button.css';

const Button = (props) => {
  const { onClickHandler, buttonText, disabled } = props;

  return (
    <button className={`btn ${disabled ? "btn--disabled" : ""}`} onClick={onClickHandler}>{buttonText}</button>
  )
};

export default Button;

