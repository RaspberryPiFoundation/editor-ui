import React, { useState } from "react";
import PropTypes from "prop-types";
import { Button } from "@raspberrypifoundation/design-system-react";
import "material-symbols";

import "../../assets/stylesheets/ListItem.scss";

const ListItem = ({ primaryText, secondaryText = false, actions = [] }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="list-item">
      <div className="list-item__details">
        <div>{primaryText}</div>
        {secondaryText && <div>{secondaryText}</div>}
      </div>

      {actions && actions.length && (
        <div className="list-item__actions">
          <Button
            type="tertiary"
            iconOnly={true}
            icon="more_vert"
            onClick={() => setOpen(!open)}
          />
        </div>
      )}

      {open && (
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
  primaryText: PropTypes.string.isRequired,
  secondaryText: PropTypes.string,
  actions: PropTypes.arrayOf(PropTypes.shape()),
};

export default ListItem;
