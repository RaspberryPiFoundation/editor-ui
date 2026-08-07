export const emptyInstructionStep = () => ({
  quiz: false,
  title: "",
  markdown_content: "",
});

export const insertStepAfter = (steps, index) => [
  ...steps.slice(0, index + 1),
  emptyInstructionStep(),
  ...steps.slice(index + 1),
];

export const removeStepAt = (steps, index) =>
  steps.filter((_, stepIndex) => stepIndex !== index);

export const updateStepMarkdown = (steps, index, markdown) =>
  steps.map((step, stepIndex) =>
    stepIndex === index ? { ...step, markdown_content: markdown } : step,
  );
