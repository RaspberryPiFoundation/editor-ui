export const config = {
  renderContent: (content) => {
    throw new Error(
      "The config.renderContent function has not been set for picamzero.",
    );
  },
};

class _Camera {
  constructor({
    brightness,
    contrast,
    exposure,
    gain,
    greyscale,
    white_balance,
  } = {}) {
    this.brightness = brightness || 0.0;
    this.contrast = contrast || 1.0;
    this.exposure = exposure;
    this.gain = gain;
    this.greyscale = greyscale || false;
    this.white_balance = white_balance || "auto";
  }

  async take_photo(name) {
    // return new Promise((resolve, reject) => {
    //   const canvas = document.createElement("canvas");
    //   canvas.width = this.width;
    //   canvas.height = this.height;
    //   const ctx = canvas.getContext("2d");
    //   const img = new Image();
    //   img.onload = () => {
    //     ctx.drawImage(img, 0, 0, this.width, this.height);
    //     resolve(canvas.toDataURL("image/jpeg", 0.5));
    //   };
    //   img.src = `https://picsum.photos/${this.width}/${this.height}`;
    // });
    let stream = null;

    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      /* use the stream */
      config.renderContent(stream);
    } catch (err) {
      /* handle the error */
      console.error(err);
    }
    console.log("capturing something...");
  }
}

export const Camera = (...args) => new _Camera(...args);
