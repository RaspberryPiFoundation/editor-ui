import React from "react";
import classNames from "classnames";
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

export default TextImage;
