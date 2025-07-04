export const uint8ArrayToBase64 = (uint8) => {
  return new Promise((resolve, reject) => {
    const blob = new Blob([uint8]);
    const reader = new FileReader();
    reader.onload = function () {
      // reader.result is a data URL: "data:application/octet-stream;base64,...."
      // We only want the part after the comma
      resolve(reader.result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const base64ToUint8Array = async (base64) => {
  return new Uint8Array(
    window
      .atob(base64)
      .split("")
      .map((c) => c.charCodeAt(0)),
  );
};
