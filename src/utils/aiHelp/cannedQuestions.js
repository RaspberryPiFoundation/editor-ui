// The questions a learner can ask the model about an error. Fixed choices
// rather than free text, so that:
//
// - the model is told exactly what the learner is stuck on, and can tailor a
//   short answer to it;
// - there is no chat box, which would invite treating the model as a person;
// - we write the questions ourselves, and can improve them from usage data.
//
// The wording is placeholder for the prototype - these are meant to be written
// per error type by the learning team. Each id is a translation key under
// `output.aiHelp.questions.<errorType>`.
export const CANNED_QUESTIONS = {
  NameError: ["whatIsVariable", "howCreateVariable", "whereCreateVariable"],
  SyntaxError: ["whatIsSyntax", "whereIsMistake", "howFindMistakes"],
  IndentationError: ["whatIsIndentation", "whichLinesIndent", "howMuchIndent"],
  TypeError: ["whatIsType", "whichValueWrongType", "howChangeType"],
  generic: ["whatDoesErrorMean", "whereShouldILook", "whatShouldITry"],
};

// errorDetails.type is the Python exception name, eg "NameError".
export const questionSetFor = (errorType) =>
  CANNED_QUESTIONS[errorType] ? errorType : "generic";

export const questionsFor = (errorType) =>
  CANNED_QUESTIONS[questionSetFor(errorType)].map((id) => ({
    id,
    key: `output.aiHelp.questions.${questionSetFor(errorType)}.${id}`,
  }));
