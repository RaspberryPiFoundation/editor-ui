import React from "react";

const TextImage = (props) => {
  const {
    className,
    text,
    title,
    imageSrc,
    imageAlt,
    imagePosition = "left",
  } = props;

  return (
    <div className={`text-image ${className}`}>
      {imagePosition === "left" && (
        <>
          <div className="text">
            <h2>{title}</h2>
            <p>{text}</p>
          </div>
          <div className="image">
            <img src={imageSrc} alt={imageAlt} />
          </div>
        </>
      )}
      {imagePosition === "right" && (
        <>
          <div className="image">
            <img src={imageSrc} alt={imageAlt} />
          </div>
          <div className="text">
            <h2>{title}</h2>
            <p>{text}</p>
          </div>
        </>
      )}
    </div>
  );
};

export default TextImage;
