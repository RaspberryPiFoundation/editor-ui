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
  const { t } = useTranslation();

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

      // Create a query to find all ERROR and MISSING nodes directly
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
          (parent.type === "ERROR" || parent.type === "MISSING") &&
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

        // Calculate character offsets for CodeMirror
        const lines = code.split("\n");
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

        // Create a problem with a more helpful error message based on context
        const getHelpfulErrorMessage = () => {
          // Get the error line text
          const errorLine = lines[startPos.row] || "";
          const nextLine = lines[startPos.row + 1] || "";

          // Use a much narrower context for error analysis - focus only on the current line and a bit of context
          // This helps prevent other errors in the file from contaminating the analysis
          const lineErrorContext = errorLine;

          // More focused context that still allows us to detect multi-line issues
          // Just a few characters before and after the error position
          const narrowErrorContext = code.slice(
            Math.max(0, fromOffset - 10),
            Math.min(code.length, toOffset + 10),
          );

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
          const lineCloseBrackets = (lineErrorContext.match(/\]/g) || [])
            .length;
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

          // 4. Indentation errors - only compare with immediate next line
          if (
            errorLine.trimStart() !== errorLine &&
            nextLine.length > 0 &&
            errorLine.length - errorLine.trimStart().length !==
              nextLine.length - nextLine.trimStart().length &&
            // Only flag if this looks like an actual code block (not just random indentation)
            (errorLine.trim().endsWith(":") ||
              nextLine.trim().startsWith("return") ||
              nextLine.trim().startsWith("if"))
          ) {
            return "Inconsistent indentation";
          }

          // 5. Missing commas in collections - limit to current line
          if (/\[[^\]]*\w+\s+\w+[^\]]*\]/.test(lineErrorContext)) {
            return "Missing comma between list items";
          }
          if (/\{[^}]*\w+\s+\w+[^}]*\}/.test(lineErrorContext)) {
            return "Missing comma between dictionary items";
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

          if (
            /print\([^'"]*[^'")\s]\)$/.test(lineErrorContext) ||
            /print\([^"]*"[^"]*\)$/.test(lineErrorContext) ||
            /print\([^']*'[^']*\)$/.test(lineErrorContext)
          ) {
            return "Unclosed string in print statement";
          }

          // Default to a more specific message when possible
          if (errorLine.trim().startsWith("def ")) {
            return "Syntax error in function definition - check for missing colon (:)";
          }

          if (errorLine.trim().startsWith("class ")) {
            return "Syntax error in class definition - check for missing colon (:)";
          }

          if (
            errorLine.trim().startsWith("if ") ||
            errorLine.trim().startsWith("elif ") ||
            errorLine.trim().startsWith("else")
          ) {
            return "Syntax error in conditional statement - check for missing colon (:)";
          }

          if (
            errorLine.trim().startsWith("for ") ||
            errorLine.trim().startsWith("while ")
          ) {
            return "Syntax error in loop statement - check for missing colon (:)";
          }

          // Default to a generic error message if we can't identify the specific issue
          return "Syntax error in Python code";
        };

        const errorMessage = getHelpfulErrorMessage();

        problems.push({
          message: errorMessage,
          severity: "error",
          from: fromOffset,
          to: toOffset,
          context: {
            row: startPos.row,
            column: startPos.column,
            text: code.slice(fromOffset, toOffset),
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
            text: code.slice(fromOffset, toOffset),
            fromOffset,
            toOffset,
          },
        );
      }

      // Log problems to console for debugging
      if (problems.length > 0) {
        console.log("Python code analysis found problems:", problems);
      } else {
        console.log("No Python syntax errors detected");
      }

      return problems;
    } catch (error) {
      console.error("Error analyzing Python code:", error);
      return [];
    }
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
