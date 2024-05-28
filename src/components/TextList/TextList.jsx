import React from "react";
import classNames from "classnames";
import PropTypes from "prop-types";
import "../../assets/stylesheets/TextList.scss";
import DesignSystemButton from "../DesignSystemButton/DesignSystemButton";
import { ReactComponent as OpenFileIcon } from "../../assets/icons/open_in_new_tab.svg";
import TextWithLink from "../SchoolOnboarding/TextWithLink";

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

  const sliceClass = classNames("text-list-slice", className);

  return (
    <div className={sliceClass} data-testid="text-list-slice">
      <div className="text-list__title-wrapper">
        {titleIcon && (
          <img className="text-list__title--icon" src={titleIcon} alt="" />
        )}
        <h2 className="text-list__title">{title}</h2>
      </div>
      {imageSrc && (
        <div className="text-list__image">
          <img src={imageSrc} alt={imageAlt} />
        </div>
      )}
      <p className="text-list__text">{text}</p>
      <h3 className="text-list__next">{next}</h3>
      <ol>
        <li>{listItems.item1}</li>
        <li>{listItems.item2}</li>
        <li>{listItems.item3}</li>
      </ol>
      <p>
        <TextWithLink
          i18nKey={contact}
          to="mailto:websupport@raspberrypi.org"
          linkClassName="text-list__link"
        />
      </p>
      <div className="text-list__buttons">
        <DesignSystemButton
          className="text-list__button"
          href={exploreProjects.url}
          text={exploreProjects.text}
          textAlways
          icon={<OpenFileIcon />}
          type="secondary"
        />
        <DesignSystemButton
          className="text-list__button"
          href={editorHome.url}
          text={editorHome.text}
          textAlways
        />
      </div>
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
    url: PropTypes.string,
    plausible: PropTypes.string,
  }),
  listItems: PropTypes.shape({
    item1: PropTypes.string,
    item2: PropTypes.string,
    item3: PropTypes.string,
  }),
};

export default TextList;
