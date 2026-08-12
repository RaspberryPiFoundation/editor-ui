export const insertStepAfter = (steps, index, markdownContent = "") => [
  ...steps.slice(0, index + 1),
  { markdown_content: markdownContent },
  ...steps.slice(index + 1),
];

export const removeStepAt = (steps, index) =>
  steps.filter((_, stepIndex) => stepIndex !== index);

export const updateStepMarkdown = (steps, index, markdown) =>
  steps.map((step, stepIndex) =>
    stepIndex === index ? { ...step, markdown_content: markdown } : step,
  );
