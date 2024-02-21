export const downloadMicroPython = async () => {
  console.log("Installing!!");
  try {
    const fileUrl =
      "https://micropython.org/download/rp2-pico/rp2-pico-latest.uf2";

    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = "rp2-pico-latest.uf2";
    document.body.appendChild(link);
    link.click();
    return "Success";
  } catch (error) {
    return error;
  }
};
