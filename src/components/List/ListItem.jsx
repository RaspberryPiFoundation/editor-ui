import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { Button } from "@raspberrypifoundation/design-system-react";
import "material-symbols";

import "../../assets/stylesheets/ListItem.scss";

const ListItem = ({
  actions,
  menuIsOpen,
  onMenuClick,
  primaryText,
  secondaryText,
}) => {
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!menuIsOpen) return;
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        onMenuClick();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef, menuIsOpen, onMenuClick]);

  return (
    <div className="list-item">
      <div className="list-item__details">
        <div>{primaryText}</div>
        {secondaryText && <div>{secondaryText}</div>}
      </div>

      {actions && actions.length && (
        <div className="list-item__actions" ref={wrapperRef}>
          <Button
            type="tertiary"
            iconOnly={true}
            icon="more_vert"
            onClick={onMenuClick}
          />
        </div>
      )}

      {menuIsOpen && (
        <div className="list-item__menu">
          {actions.map((action) => (
            <Button
              className="list-item__button"
              type="tertiary"
              fullWidth="true"
              {...action}
            />
          ))}
        </div>
      )}
    </div>
  );
};

ListItem.propTypes = {
  actions: PropTypes.arrayOf(PropTypes.shape()),
  isMenuOpen: PropTypes.bool.isRequired,
  onMenuOpen: PropTypes.func.isRequired,
  primaryText: PropTypes.string.isRequired,
  secondaryText: PropTypes.string,
};

export default ListItem;
