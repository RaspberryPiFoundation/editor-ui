import { useEffect, useState } from "react";
import { Parser, Language } from "web-tree-sitter";
import { Decoration } from "@codemirror/view";
import { StateEffect } from "@codemirror/state";
import { useTranslation } from "react-i18next";

/**
 * Custom hook to manage Tree Sitter parser for code analysis, particularly Python syntax checking
 * @param {string} extension - File extension to determine if parsing is needed
 * @param {string} fileName - Name of the file being edited
 * @returns {Object} Parser state and functions for code analysis
 */
const useTreeSitterParser = (extension, fileName) => {
  const [treeSitterParser, setTreeSitterParser] = useState(null);
  const [parserInitialized, setParserInitialized] = useState(false);
  const { t } = useTranslation(); // TODO: use for localization of error messages

  // Create effect for problem decorations
  const problemDecorationsEffect = StateEffect.define();

  // Initialize Tree-sitter parser for Python (WASM version)
  useEffect(() => {
    if (extension !== "py") {
      setParserInitialized(false);
      return;
    }

    const initTreeSitter = async () => {
      try {
        await Parser.init({
          locateFile() {
            return `${process.env.PUBLIC_URL}/wasm/tree-sitter.wasm`;
          },
        });

        const parser = new Parser();
        const response = await fetch(
          `${process.env.PUBLIC_URL}/wasm/tree-sitter-python.wasm`,
        );
        const wasmBytes = await response.arrayBuffer();
        const pythonLanguage = await Language.load(new Uint8Array(wasmBytes));

        await parser.setLanguage(pythonLanguage);
        setTreeSitterParser(parser);
        setParserInitialized(true);

        console.log(
          "Tree-sitter Python parser initialized successfully for",
          fileName,
        );
      } catch (error) {
        console.error("Failed to initialize Tree-sitter:", error);
        setParserInitialized(false);
      }
    };

    initTreeSitter();
  }, [extension, fileName]);

  function calculateOffsets(lines, startPos, clampedEndPos, errorMessage) {
    let errorLine = lines[startPos.row] || "";
    const commentIndex = errorLine.indexOf("#");
    if (commentIndex >= 0) {
      errorLine = errorLine.substring(0, commentIndex);
    }

    let fromOffset = 0;
    for (let i = 0; i < startPos.row; i++) {
      fromOffset += lines[i].length + 1; // +1 for newline
    }
    fromOffset += startPos.column;

    let toOffset = fromOffset; // Default if same position
    if (
      startPos.row === clampedEndPos.row &&
      startPos.column === clampedEndPos.column
    ) {
      // Zero-width error, extend by one character for visibility
      toOffset = fromOffset + 1;
    } else {
      // Calculate end offset based on clamped position
      toOffset = 0;
      for (let i = 0; i < clampedEndPos.row; i++) {
        toOffset += lines[i].length + 1;
      }
      toOffset += clampedEndPos.column;
    }

    // Default to using the original range
    let adjustedFromOffset = fromOffset;
    let adjustedToOffset = toOffset;

    // Special handling for "Missing comma between items" errors
    if (errorMessage.startsWith("Missing comma between")) {
      try {
        // Find the pattern of two items with whitespace between them (where comma should be)
        let missingCommaRegex;
        if (errorMessage.includes("list")) {
          missingCommaRegex = /(\w+)\s+(\w+)/g;
        } else if (errorMessage.includes("dictionary")) {
          missingCommaRegex = /(\w+:\s*\w+)\s+(\w+)/g;
        } else {
          missingCommaRegex = /(\w+)\s+(\w+)/g;
        }

        // Find all matches - we want to find the specific occurrence that's causing the error
        const matches = [...errorLine.matchAll(missingCommaRegex)];

        if (matches.length > 0) {
          // Find match closest to error position
          let bestMatch = matches[0];
          let bestDistance = Infinity;

          for (const match of matches) {
            const matchStart = errorLine.indexOf(match[0]);
            const distance = Math.abs(matchStart - startPos.column);

            if (distance < bestDistance) {
              bestDistance = distance;
              bestMatch = match;
            }
          }

          // Calculate the position of this match in the original line
          const matchStart = errorLine.indexOf(bestMatch[0]);
          const matchEnd = matchStart + bestMatch[0].length;

          // Adjust the offsets to highlight just the items and whitespace between them
          const lineStartOffset = fromOffset - startPos.column; // Start of the line
          adjustedFromOffset = lineStartOffset + matchStart;
          adjustedToOffset = lineStartOffset + matchEnd;

          console.log("Adjusted missing comma range:", {
            original: { from: fromOffset, to: toOffset },
            adjusted: { from: adjustedFromOffset, to: adjustedToOffset },
            match: bestMatch[0],
          });
        }
      } catch (e) {
        console.error("Error processing missing comma pattern:", e);
        // Fall back to default highlighting if regex fails
      }
    }

    // If the error occurs in a line with comments, make sure we only highlight the code portion
    if (commentIndex >= 0) {
      const lineStartOffset = fromOffset - startPos.column; // Start of the line
      const commentStartOffset = lineStartOffset + commentIndex;

      // Don't extend highlighting into the comment
      if (adjustedToOffset > commentStartOffset) {
        adjustedToOffset = commentStartOffset;
      }
    }
    return { fromOffset, toOffset, adjustedFromOffset, adjustedToOffset };
  }

  /**
   * Analyze Python code for syntax errors using Tree-sitter
   * @param {string} code - Python code to analyze
   * @returns {Array} Array of detected problems
   */
  const analyzePythonCode = async (code) => {
    if (!treeSitterParser || extension !== "py") return [];

    try {
      const tree = treeSitterParser.parse(code);
      const problems = [];

      // Create a query to find all ERROR nodes directly
      const queryString = `
        (ERROR) @error
      `;

      const query = treeSitterParser.language.query(queryString);
      const matches = query.matches(tree.rootNode);

      console.log(`Found ${matches.length} potential syntax errors via query`);

      // Process each matched error node
      for (const match of matches) {
        const node = match.captures[0].node;
        const nodeType = node.type;
        const startPos = node.startPosition;
        const endPos = node.endPosition;

        // Skip nested errors at the same position
        const parent = node.parent;
        if (
          parent &&
          parent.type === "ERROR" &&
          parent.startPosition.row === startPos.row &&
          parent.startPosition.column === startPos.column &&
          parent.endPosition.row === endPos.row &&
          parent.endPosition.column === endPos.column
        ) {
          console.log(`Skipping nested ${nodeType} at same position`, startPos);
          continue;
        }

        // Clamp large error ranges to just the current line plus one
        let clampedEndPos = { ...endPos };
        if (endPos.row > startPos.row) {
          clampedEndPos = {
            row: startPos.row + 1,
            column: 0,
          };
          console.log(
            `Clamping large error range from line ${startPos.row} to ${endPos.row}, now ends at ${clampedEndPos.row}`,
          );
        }

        const lines = code.split("\n");

        const errorMessage = getHelpfulErrorMessage(lines, startPos);

        // Calculate character offsets for CodeMirror
        let { fromOffset, toOffset, adjustedFromOffset, adjustedToOffset } =
          calculateOffsets(lines, startPos, clampedEndPos, errorMessage);

        problems.push({
          message: errorMessage,
          severity: "error",
          from: adjustedFromOffset,
          to: adjustedToOffset,
          context: {
            row: startPos.row,
            column: startPos.column,
            text: code.slice(adjustedFromOffset, adjustedToOffset),
            nodeType: nodeType,
          },
        });

        console.log(
          `Found ${nodeType} at line ${startPos.row + 1}, column ${
            startPos.column
          }`,
          {
            nodeType: nodeType,
            parent: parent?.type,
            text: code.slice(adjustedFromOffset, adjustedToOffset),
            fromOffset,
            toOffset,
            adjustedFromOffset,
            adjustedToOffset,
          },
        );
      }

      // Log problems to console for debugging
      if (problems.length > 0) {
        console.log("Python code analysis found problems:", problems);
        // before returning problems, remove any overlapping ones. Check if on same row, and take the one that is wider
        const nonOverlappingProblems = [];
        for (const problem of problems) {
          // check if same context row
          const overlap = nonOverlappingProblems.find(
            (p) => p.context.row === problem.context.row,
          );
          if (overlap) {
            // if the new problem is wider, replace the old one
            if (problem.to - problem.from > overlap.to - overlap.from) {
              const index = nonOverlappingProblems.indexOf(overlap);
              nonOverlappingProblems[index] = problem;
            }
          } else {
            nonOverlappingProblems.push(problem);
          }
        }
        console.log(
          "Returning non-overlapping problems:",
          nonOverlappingProblems,
        );
        return nonOverlappingProblems;
      } else {
        console.log("No Python syntax errors detected");
        return problems;
      }
    } catch (error) {
      console.error("Error analyzing Python code:", error);
      return [];
    }
  };

  const getHelpfulErrorMessage = (lines, startPos) => {
    // Get the error line text
    let errorLine = lines[startPos.row] || "";
    // remove any comments from the line for analysis
    errorLine = errorLine.split("#")[0];

    const nextLine = lines[startPos.row + 1] || "";

    // Use a much narrower context for error analysis - focus only on the current line and a bit of context
    // This helps prevent other errors in the file from contaminating the analysis
    const lineErrorContext = errorLine;

    // More focused context that still allows us to detect multi-line issues
    // Just a few characters before and after the error position
    const narrowErrorContext = [
      startPos.row > 0 ? lines[startPos.row - 1] : "", // Previous line
      errorLine, // Error line
      nextLine, // Next line
    ]
      .filter(Boolean)
      .join("\n");

    console.log("Error detection context:", {
      line: startPos.row + 1,
      errorLine,
      narrowContext: narrowErrorContext,
    });

    // Check for common Python syntax errors with more precise contexts

    // 0. Missing operator between values (takes precedence over other checks)
    // This matches patterns like "x = 5 6" or "y = a b" where an operator is missing
    if (
      /=\s*\w+\s+\d+/.test(lineErrorContext) ||
      /=\s*\d+\s+\w+/.test(lineErrorContext) ||
      /=\s*\d+\s+\d+/.test(lineErrorContext) ||
      /=\s*\w+\s+\w+/.test(lineErrorContext) ||
      /\w+\s+\d+\s*$/.test(lineErrorContext.trim()) ||
      /\d+\s+\w+\s*$/.test(lineErrorContext.trim()) ||
      /\d+\s+\d+\s*$/.test(lineErrorContext.trim())
    ) {
      // Check if the error is at the position of the missing operator
      return "Missing operator between values (did you mean +, -, *, /, etc.?)";
    }

    // 1. Missing colons - only check the current line and be more specific about patterns
    if (
      /^\s*(if|elif|else|for|while|def|class|with|try|except|finally)\b[^:]*$/.test(
        errorLine.trim(),
      ) ||
      /^\s*(if|elif|else|for|while|def|class|with|try|except|finally)\b.*[^:][\s]*$/.test(
        errorLine.trim(),
      )
    ) {
      // Determine which statement is missing the colon
      const match = errorLine.match(
        /^\s*(if|elif|else|for|while|def|class|with|try|except|finally)\b/,
      );
      const statement = match ? match[1] : "statement";
      return `Missing colon : after ${statement} statement`;
    }

    // 2. Unclosed strings - only check within the current line
    const doubleQuotes = (lineErrorContext.match(/"/g) || []).length;
    const singleQuotes = (lineErrorContext.match(/'/g) || []).length;

    if (doubleQuotes % 2 !== 0) {
      return 'Unclosed string - missing double quote "';
    }
    if (singleQuotes % 2 !== 0) {
      return "Unclosed string - missing single quote '";
    }

    // 3. Unbalanced parentheses/brackets - use narrow context
    // Focus on immediate context around the error to prevent false positives
    const openParens = (narrowErrorContext.match(/\(/g) || []).length;
    const closeParens = (narrowErrorContext.match(/\)/g) || []).length;
    const openBrackets = (narrowErrorContext.match(/\[/g) || []).length;
    const closeBrackets = (narrowErrorContext.match(/]/g) || []).length;
    const openBraces = (narrowErrorContext.match(/\{/g) || []).length;
    const closeBraces = (narrowErrorContext.match(/}/g) || []).length;

    // Check if the error is at the line level with unbalanced brackets
    const lineOpenParens = (lineErrorContext.match(/\(/g) || []).length;
    const lineCloseParens = (lineErrorContext.match(/\)/g) || []).length;
    const lineOpenBrackets = (lineErrorContext.match(/\[/g) || []).length;
    const lineCloseBrackets = (lineErrorContext.match(/\]/g) || []).length;
    const lineOpenBraces = (lineErrorContext.match(/\{/g) || []).length;
    const lineCloseBraces = (lineErrorContext.match(/\}/g) || []).length;

    // Check line level first, then narrow context
    if (lineOpenParens > lineCloseParens) {
      return "Missing closing parenthesis ) in this line";
    } else if (lineOpenParens < lineCloseParens) {
      return "Unexpected closing parenthesis ) in this line, did you mean to open one with (";
    } else if (openParens > closeParens) {
      return "Missing closing parenthesis )'";
    } else if (openParens < closeParens) {
      return "Unexpected closing parenthesis ), did you mean to open one with (";
    }

    if (lineOpenBrackets > lineCloseBrackets) {
      return "Missing closing bracket ']' in this line";
    } else if (lineOpenBrackets < lineCloseBrackets) {
      return "Unexpected closing bracket ']' in this line";
    } else if (openBrackets > closeBrackets) {
      return "Missing closing bracket ']'";
    } else if (openBrackets < closeBrackets) {
      return "Unexpected closing bracket ']'";
    }

    if (lineOpenBraces > lineCloseBraces) {
      return "Missing closing brace '}' in this line";
    } else if (lineOpenBraces < lineCloseBraces) {
      return "Unexpected closing brace '}' in this line";
    } else if (openBraces > closeBraces) {
      return "Missing closing brace '}'";
    } else if (openBraces < closeBraces) {
      return "Unexpected closing brace '}'";
    }

    // 5. Missing commas in collections - limit to current line
    if (/\[[^\]]*\w+\s+\w+[^\]]*]/.test(lineErrorContext)) {
      return "Missing comma between list items";
    }
    if (/\{[^}]*\w+\s+\w+[^}]*}/.test(lineErrorContext)) {
      return "Missing comma between dictionary items";
    }
    if (/\([^)]*\w+\s+\w+[^)]*\)/.test(lineErrorContext)) {
      return "Missing comma between items";
    }

    // 6. Invalid Python syntax - using = instead of == for comparison
    if (/\s*if\s+\w+\s*=\s*\w+/.test(lineErrorContext)) {
      return "Using = for comparison instead of == in condition";
    }

    // 7. Invalid assignment
    if (/^\s*\d+\s*=/.test(lineErrorContext)) {
      return "Cannot assign to a literal (number)";
    }

    // 8. End with backslash
    if (errorLine.trim().endsWith("\\")) {
      return "Line ending with backslash \\ - did you mean to continue the line?";
    }

    // 9. Check for print statements with errors (like missing parentheses or quotes)
    if (/^\s*print\s+[^(]/.test(lineErrorContext)) {
      return "print() function requires parentheses";
    }

    // Default to a more specific message when possible
    const syntaxErrorPatterns = {
      "def ": "Syntax error in function definition",
      "class ": "Syntax error in class definition",
      "if ": "Syntax error in conditional statement",
      "elif ": "Syntax error in conditional statement",
      else: "Syntax error in conditional statement",
      "for ": "Syntax error in loop statement",
      "while ": "Syntax error in loop statement",
    };

    const trimmedLine = errorLine.trim();
    for (const [pattern, message] of Object.entries(syntaxErrorPatterns)) {
      if (trimmedLine.startsWith(pattern)) {
        return message;
      }
    }

    // Default to a generic error message if we can't identify the specific issue
    return "Syntax error in Python code";
  };

  /**
   * Create CodeMirror decorations for problem areas
   * @param {EditorState} state - Current editor state
   * @param {Array} problems - Array of detected problems
   * @returns {DecorationSet} Set of decorations to apply to the editor
   */
  const createProblemDecorations = (state, problems) => {
    const decorations = problems.map((problem) => {
      // Create simple class based on severity
      let className = "problem-marker";
      console.log("Creating decoration for problem:", problem);
      if (problem.severity === "error") {
        className += " problem-error";
      } else if (problem.severity === "warning") {
        className += " problem-warning";
      }

      // Use the problem ranges directly
      const from = problem.from;
      const to = problem.to;

      // Get line number for tooltip positioning
      const lineNumber = state.doc.lineAt(from).number - 1; // Convert to 0-based

      // Simplify error type to always get the red border
      const errorType = "missing-syntax"; // This will always trigger the red left border

      // Use the problem message directly
      const friendlyMessage = problem.message;

      // Basic position logic for tooltips
      const totalLines = state.doc.lines;
      let linePosition = "";
      if (lineNumber >= totalLines - 3) {
        linePosition = "top";
      } else if (lineNumber < 2) {
        linePosition = "bottom";
      }

      // Create decoration with consistent format
      return Decoration.mark({
        class: className,
        attributes: {
          "data-message": friendlyMessage,
          "data-error-type": errorType,
          "data-line": lineNumber.toString(),
          "data-severity": problem.severity || "error",
          ...(linePosition && { "data-line-position": linePosition }),
        },
      }).range(from, to);
    });

    return Decoration.set(decorations, true);
  };

  return {
    treeSitterParser,
    parserInitialized,
    analyzePythonCode,
    createProblemDecorations,
    problemDecorationsEffect,
  };
};

export default useTreeSitterParser;
