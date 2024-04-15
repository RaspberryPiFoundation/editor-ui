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
    exploreProjects = {},
    editorHome = {},
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
        href={exploreProjects.url}
        text={exploreProjects.text}
        textAlways
        onClick={onClickPlausible(exploreProjects.plausible)}
      />
      <DesignSystemButton
        className="text-list__button"
        href={editorHome.url}
        text={editorHome.text}
        textAlways
        onClick={onClickPlausible(editorHome.plausible)}
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
  exploreProjects: PropTypes.shape({
    text: PropTypes.string,
    url: PropTypes.string,
    plausible: PropTypes.string,
  }),
  editorHome: PropTypes.shape({
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
