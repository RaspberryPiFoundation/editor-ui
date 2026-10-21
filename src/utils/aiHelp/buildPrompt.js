import {
  BASE_SYSTEM_PROMPT,
  COMPLETIONS_SYSTEM_PROMPT,
  GUIDELINES,
  LEVEL_INSTRUCTIONS,
  NO_REPLY_POSSIBLE,
  USER_TURN_REMINDER,
} from "./prompts";

// These models are 0.4B-4B and have small context windows, and the answer is
// capped at a few hundred tokens anyway. Sending a whole multi-file project is
// wasted budget, so cap the code we send.
export const MAX_CODE_CHARS = 8000;

// Mirrors PromptConfig#full_system_prompt in the SLM evaluation harness
// (system_prompt + "\n\n" + guidelines.md), with the level block appended.
export const buildSystemPrompt = (level) => {
  const instruction = LEVEL_INSTRUCTIONS[level];
  if (!instruction) {
    throw new Error(`Unknown support level: ${level}`);
  }
  // NO_REPLY_POSSIBLE goes last, not the level block: it is the instruction
  // small models most often drop, and recency is what keeps them holding it.
  return [BASE_SYSTEM_PROMPT, GUIDELINES, instruction, NO_REPLY_POSSIBLE].join(
    "\n\n",
  );
};

const pythonComponents = (components = []) =>
  components.filter(({ extension }) => extension === "py");

const filenameOf = ({ name, extension }) => `${name}.${extension}`;

// The erroring file matters most, so it is sent first and never dropped. Other
// files are context and are dropped from the end once the budget is spent.
const orderByRelevance = (files, erroringFile) => {
  const index = files.findIndex((file) => filenameOf(file) === erroringFile);
  if (index < 0) {
    return files;
  }
  return [files[index], ...files.filter((_, i) => i !== index)];
};

export const buildCodeBlock = (components, erroringFile) => {
  const files = orderByRelevance(pythonComponents(components), erroringFile);
  if (files.length === 0) {
    return "";
  }

  // A single file is sent bare, so the prompt is byte-identical to the harness's
  // for the single-file cases its corpus is made of. Only add filename headers
  // when there is genuinely more than one file to tell apart.
  if (files.length === 1) {
    return (files[0].content ?? "").trim();
  }

  const sections = [];
  let budget = MAX_CODE_CHARS;

  for (const file of files) {
    const section = `# ${filenameOf(file)}\n${(file.content ?? "").trim()}`;
    // Always include the first (erroring) file, even if it alone blows the
    // budget - truncated context on the relevant file beats none at all.
    if (sections.length > 0 && section.length > budget) {
      break;
    }
    sections.push(section);
    budget -= section.length;
  }

  return sections.join("\n\n").slice(0, MAX_CODE_CHARS);
};

// What the learner has already read. The model is told about it so it does not
// spend its short answer repeating copy the learner has just dismissed as
// unhelpful.
//
// NOTE: this block has no counterpart in the SLM evaluation harness, whose user
// turn is only code + error + question. It is a deliberate divergence: prompts
// sent from here are not a like-for-like replay of a scored run.
export const buildAlreadyShownBlock = (friendlyError) => {
  if (!friendlyError) {
    return "";
  }

  const { title, summary, why, steps } = friendlyError;
  const lines = [title, summary, why].filter(Boolean);
  if (steps?.length) {
    lines.push(...steps.map((step) => `- ${step}`));
  }
  if (lines.length === 0) {
    return "";
  }

  return [
    "I have already been shown this explanation, and it did not help:",
    "",
    ...lines,
  ].join("\n");
};

// Mirrors TestCase#prompt in the harness for the code and error blocks.
export const buildUserTurn = ({
  components,
  error,
  friendlyError,
  erroringFile,
}) => {
  const code = buildCodeBlock(components, erroringFile);
  const errorText = (error ?? "").trim();
  const alreadyShown = buildAlreadyShownBlock(friendlyError);

  const parts = [];
  if (code) {
    parts.push(`Here is my Python code:\n\n\`\`\`python\n${code}\n\`\`\``);
  }
  if (errorText) {
    parts.push(`This is the error I get:\n\n\`\`\`\n${errorText}\n\`\`\``);
  }
  if (alreadyShown) {
    parts.push(alreadyShown);
  }
  if (parts.length > 0) {
    parts.push(USER_TURN_REMINDER);
  }

  return parts.join("\n\n");
};

// What the learner is taken to have said to get to this rung, in their own
// voice. The system prompt already describes the rung; this is what makes the
// replayed conversation read as a conversation.
export const FOLLOW_UPS = {
  hint: "That did not help me. Can you tell me exactly what to change?",
  solve: "I am still stuck. Please just show me the fix.",
};

// Ollama /api/chat messages. The previous model turn is replayed so a later rung
// can see what it already said and not repeat it. Only the most recent turn is
// sent: it keeps strict user/assistant alternation, and these context windows
// are too small to spend on older turns the learner has already rejected.
export const buildMessages = ({ level, previousTurn, ...context }) => {
  const messages = [
    { role: "system", content: buildSystemPrompt(level) },
    { role: "user", content: buildUserTurn(context) },
  ];

  if (previousTurn?.text && FOLLOW_UPS[level]) {
    messages.push({ role: "assistant", content: previousTurn.text });
    messages.push({ role: "user", content: FOLLOW_UPS[level] });
  }

  return messages;
};

// Concept 3. The learner's own question goes at the very end of the user turn,
// after everything else, because it is the thing the model has to answer.
export const buildQuestionMessages = ({ question, ...context }) => [
  { role: "system", content: buildSystemPrompt("question") },
  {
    role: "user",
    content: [buildUserTurn(context), `My question: ${question}`]
      .filter(Boolean)
      .join("\n\n"),
  },
];

export const buildCompletionMessages = ({ starter, ...context }) => [
  { role: "system", content: COMPLETIONS_SYSTEM_PROMPT },
  {
    role: "user",
    content: [
      buildUserTurn(context),
      `The words I have started my question with: "${starter}"`,
    ]
      .filter(Boolean)
      .join("\n\n"),
  },
];
