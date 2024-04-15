import React from "react";
import classNames from "classnames";
import PropTypes from "prop-types";
import "../../assets/stylesheets/TextList.scss";
import DesignSystemButton from "../DesignSystemButton/DesignSystemButton";

const TextList = (props) => {
  const {
    className,
    title,
    titleIcon,
    text,
    next,
    imageSrc,
    imageAlt,
    listItems = {},
    contact,
    button1 = {},
    button2 = {},
  } = props;

  const sliceClass = classNames("text-image-slice", className);
  const onClickPlausible = (msg) => () => {
    if (window.plausible) {
      window.plausible(msg);
    }
  };

  return (
    <div className={sliceClass} data-testid="text-list">
      {titleIcon && (
        <img className="text-list__title--icon" src={titleIcon} alt="" />
      )}
      <h2 className="text-list__title">{title}</h2>
      {imageSrc && (
        <div className="text-list__image">
          <img src={imageSrc} alt={imageAlt} />
        </div>
      )}
      <p>{text}</p>
      <h3>{next}</h3>
      <ol>
        {Object.values(listItems).map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ol>
      <p>{contact}</p>
      <DesignSystemButton
        className="text-list__button"
        href={button1.url}
        text={button1.text}
        textAlways
        onClick={onClickPlausible(button1.plausible)}
      />
      <DesignSystemButton
        className="text-list__button"
        href={button2.url}
        text={button2.text}
        textAlways
        onClick={onClickPlausible(button2.plausible)}
        type="secondary"
      />
    </div>
  );
};

TextList.propTypes = {
  text: PropTypes.string.isRequired,
  title: PropTypes.string,
  next: PropTypes.string,
  contact: PropTypes.string,
  imageSrc: PropTypes.string,
  imageAlt: PropTypes.string,
  urlText: PropTypes.string,
  urlHref: PropTypes.string,
  button1: PropTypes.shape({
    text: PropTypes.string,
    url: PropTypes.string,
    plausible: PropTypes.string,
  }),
  button2: PropTypes.shape({
    text: PropTypes.string,
    plausible: PropTypes.string,
  }),
  listItems: PropTypes.shape({
    item1: PropTypes.string,
    item2: PropTypes.string,
    item3: PropTypes.string,
  }),
};

export default TextList;
