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
    imagePosition = "left",
    urlText,
    urlHref,
  } = props;

  const sliceClass = classNames("text-image-slice", className);

  return (
    <div className={sliceClass} data-testid="text-image-slice">
      {imagePosition === "left" && (
        <>
          <div className="text-image-slice__text">
            <h2>madzia</h2>
            <h2 className="" dangerouslySetInnerHTML={{ __html: title }} />
            <p>{text}</p>
            {urlText && (
              <span className="text-image-slice__text--link">
                <a href={urlHref}>{urlText}</a>
              </span>
            )}
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
          {urlText && (
            <span className="text-image-slice__text--link">
              <a href={urlHref}>{urlText}</a>
            </span>
          )}
        </>
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
