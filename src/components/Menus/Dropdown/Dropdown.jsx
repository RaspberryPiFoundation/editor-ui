import React, { useEffect, useRef, useState } from "react";
import Button from "../../Button/Button";

import "../../../assets/stylesheets/Dropdown.scss";

const Dropdown = (props) => {
  const {
    ButtonIcon,
    buttonImage,
    buttonImageAltText,
    buttonText,
    MenuContent,
  } = props;
  const [isOpen, setOpen] = useState(false);
  const dropdown = useRef();

  useEffect(() => {
    /**
     * Close menu if clicked outside of element
     */
    function handleClickOutside(event) {
      if (dropdown.current && !dropdown.current.contains(event.target)) {
        setOpen(false);
      }
    }
    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdown]);

  const handleKeyDown = (event) => {
    if (event.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div className="dropdown" ref={dropdown} onKeyDown={handleKeyDown}>
      <Button
        className={`btn--tertiary dropdown-button${
          isOpen ? " dropdown-button--active" : ""
        }`}
        onClickHandler={() => setOpen(!isOpen)}
        buttonText={buttonText}
        ButtonIcon={ButtonIcon}
        buttonImage={buttonImage}
        buttonImageAltText={buttonImageAltText}
      />

      {isOpen && (
        <>
          <div
            className="dropdown-backdrop"
            onClick={() => setOpen(false)}
          ></div>
          <MenuContent />
        </>
      )}
    </div>
  );
};

export default Dropdown;
