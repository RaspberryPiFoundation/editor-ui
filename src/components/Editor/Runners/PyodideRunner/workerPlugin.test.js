// workerPlugin.js
test("worker responds correctly to message", async () => {
  const worker = require("./workerPlugin.js");

  const result = await worker.processMessage(5);

  expect(result).toBe(10);
});
