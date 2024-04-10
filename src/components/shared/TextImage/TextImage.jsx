import React from "react";
import classNames from "classnames";
import PropTypes from "prop-types";
import "../../../assets/stylesheets/TextImage.scss";

const TextImage = (props) => {
  const {
    className,
    text,
    title,
    imageSrc,
    imageAlt,
    imagePosition = "left",
  } = props;

  const sliceClass = classNames("text-image-slice", className);

  return (
    <div className={sliceClass} data-testid="text-image-slice">
      {imagePosition === "left" && (
        <>
          <div className="text-image-slice__text">
            <h2>{title}</h2>
            <p>{text}</p>
          </div>
          <div className="text-image-slice__image image--left">
            <img src={imageSrc} alt={imageAlt} />
          </div>
        </>
      )}
      {imagePosition === "right" && (
        <>
          <div className="text-image-slice__image image--right">
            <img src={imageSrc} alt={imageAlt} />
          </div>
          <div className="text-image-slice__text">
            <h2>{title}</h2>
            <p>{text}</p>
          </div>
        </>
      )}
    </div>
  );

};

TextImage.propTypes = {
  text: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  imageSrc: PropTypes.string.isRequired,
  imageAlt: PropTypes.string.isRequired,
  imagePosition: PropTypes.oneOf(["left", "right"]),
};

export default TextImage;
