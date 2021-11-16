import './Button.css';

const Button = (props) => {
  const { onClickHandler, buttonText, leftAlign } = props;

  return (
    <button className={`btn ${leftAlign ? "btn--left-align" : "" }`} onClick={onClickHandler}>{buttonText}</button>
  )
};

export default Button;

