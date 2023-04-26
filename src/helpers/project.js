const Project = {};

Project.isBlockBased = (content) =>
  content && content.software && content.software.indexOf("scratch") !== -1;

Project.technology = (content) =>
  Project.isBlockBased(content) ? "Scratch" : "Python";

Project.badgeKeyFor = (name) => name.replace(/_/g, "-");

Project.canBadgeBeAwardedOn = (step) => step.title === "Reflection";

Project.isQuiz = (step) => step.knowledgeQuiz && step.knowledgeQuiz.length > 0;

export default Project;
