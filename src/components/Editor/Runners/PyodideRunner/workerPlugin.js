export const processMessage = (data) => {
  console.log("Processing message:", data);
  return data * 2;
};

addEventListener("message", ({ data }) => {
  postMessage(processMessage(data));
});
