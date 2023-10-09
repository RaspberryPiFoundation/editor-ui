import "./ErrorMessage.scss";
import { useSelector } from "react-redux";

const NameErrorMessage = () => {
  const error = useSelector((state) => state.editor.nameError);

  return error ? (
    <div className="error-message">
      <p className="error-message__content">{error}</p>
    </div>
  ) : null;
};

export default NameErrorMessage;
