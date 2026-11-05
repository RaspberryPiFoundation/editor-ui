const OPENING_BRACKETS = "([{";
const CLOSING_BRACKETS = ")]}";

// Returns the line number of the innermost bracket that is still open at the
// end of the line before `beforeLine` (or at the end of the source when
// `beforeLine` is omitted), or null if every bracket is closed. Brackets in
// strings and comments are ignored. Used to correct Skulpt's line numbers for
// unclosed brackets, which point at EOF or at the next statement instead.
export const findUnclosedBracketLine = (source, beforeLine = Infinity) => {
  const openBracketLines = [];
  // Line number starting from 1
  let line = 1;
  let i = 0;

  while (i < source.length && line < beforeLine) {
    const char = source[i];

    if (char === "\n") {
      line += 1;
      i += 1;
    } else if (char === "#") {
      while (i < source.length && source[i] !== "\n") {
        i += 1;
      }
    } else if (char === '"' || char === "'") {
      const tripleQuote = char.repeat(3);
      const quote = source.startsWith(tripleQuote, i) ? tripleQuote : char;
      i += quote.length;
      while (i < source.length && !source.startsWith(quote, i)) {
        if (source[i] === "\n") {
          // An unterminated single-quoted string ends at the newline
          if (quote.length === 1) break;
          line += 1;
        } else if (source[i] === "\\") {
          i += 1;
          if (source[i] === "\n") line += 1;
        }
        i += 1;
      }
      if (source.startsWith(quote, i)) i += quote.length;
    } else {
      if (OPENING_BRACKETS.includes(char)) {
        openBracketLines.push(line);
      } else if (CLOSING_BRACKETS.includes(char)) {
        openBracketLines.pop();
      }
      i += 1;
    }
  }

  return openBracketLines.length > 0
    ? openBracketLines[openBracketLines.length - 1]
    : null;
};
