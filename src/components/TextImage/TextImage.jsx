import React from "react";
import classNames from "classnames";
import PropTypes from "prop-types";
import "../../assets/stylesheets/TextImage.scss";

const TextImage = (props) => {
  const {
    className,
    text,
    title,
    imageSrc,
    imageAlt,
    imagePosition = "right",
    urlText,
    urlHref,
  } = props;

  const sliceClass = classNames("text-image-slice", className, {
    "text-image-slice--left": imagePosition === "left",
    "text-image-slice--right": imagePosition === "right",
  });

  return (
    <div className={sliceClass} data-testid="text-image-slice">
      <div
        className={`text-image-slice__content ${
          !imageSrc ? "text-image-slice--no-image" : ""
        }`}
      >
        <h2 className="text-image-slice__title">{title}</h2>
        <p className="text-image-slice__text">{text}</p>
        {urlText && (
          <span className="text-image-slice__link">
            <a href={urlHref}>{urlText}</a>
          </span>
        )}
      </div>
      {imageSrc && (
        <div className="text-image-slice__image">
          <img src={imageSrc} alt={imageAlt} />
        </div>
      )}
    </div>
  );
};

TextImage.propTypes = {
  text: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  imageSrc: PropTypes.string,
  imageAlt: PropTypes.string,
  imagePosition: PropTypes.oneOf(["left", "right"]),
  urlText: PropTypes.string,
  urlHref: PropTypes.string,
};

export default TextImage;
