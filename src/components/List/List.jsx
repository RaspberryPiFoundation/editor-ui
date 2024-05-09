import React, { useState } from "react";
import PropTypes from "prop-types";
import "material-symbols";
import classNames from "classnames";

import ListItem from "./ListItem";
import "../../assets/stylesheets/List.scss";

const List = ({ items, noItemMessage }) => {
  const hasItems = !!items && items.length;

  const [openItem, setOpenItem] = useState(-1);

  return (
    <div className="list">
      <div
        className={classNames("list__items", {
          "list__items--error": !hasItems,
        })}
      >
        {!hasItems && <div>{noItemMessage}</div>}
        {!!hasItems &&
          items.map((item, i) => (
            <div className="list__item">
              <ListItem
                primaryText={item.primaryText}
                secondaryText={item.secondaryText}
                actions={item.actions}
                menuIsOpen={i === openItem}
                onMenuClick={() => setOpenItem(i === openItem ? -1 : i)}
              />
            </div>
          ))}
      </div>
    </div>
  );
};

List.propTypes = {
  items: PropTypes.string.isRequired,
  noItemMessage: PropTypes.string.isRequired,
};

export default List;
