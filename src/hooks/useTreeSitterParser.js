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
      const handledLines = new Set(); // Track lines we've already handled
      let hasMissingColonError = false; // Track if we've found a missing colon error

      // Look for syntax errors by checking for ERROR nodes
      const errorQuery = treeSitterParser.language.query(`(ERROR) @error`);
      const errorMatches = errorQuery.captures(tree.rootNode);

      for (const match of errorMatches) {
        const errorNode = match.node;
        const startPos = errorNode.startPosition;
        const endPos = errorNode.endPosition;
        const errorText = code.slice(errorNode.startIndex, errorNode.endIndex);

        // Get surrounding code for better context
        const lineContent = code.split("\n")[startPos.row] || "";

        // Get context - parent and siblings
        const parent = errorNode.parent;
        const prevSibling = errorNode.previousSibling;
        const nextSibling = errorNode.nextSibling;

        // Default error message
        let message = t("editorPanel.pythonSyntaxErrors.default");

        // Case 1: Check for unrecognized identifiers followed by open parenthesis (undefined function)
        if (parent && parent.type === "ERROR" && errorText.match(/\w+\s*\(/)) {
          // First, check if this is a function definition without a colon
          if (lineContent.trim().startsWith('def ') && !lineContent.includes(':')) {
            // This is a function definition missing a colon
            message = t("editorPanel.pythonSyntaxErrors.missingColon");
            hasMissingColonError = true;

            // Add this directly to problems with the proper highlighting
            problems.push({
              message,
              severity: "error",
              // Use the entire line for highlighting
              from: errorNode.startIndex - startPos.column, // Beginning of the line
              to: errorNode.startIndex - startPos.column + lineContent.length, // End of the line
              context: {
                row: startPos.row,
                column: 0,
                text: lineContent,
                isMissingColon: true
              },
            });

            // Mark this line as handled
            handledLines.add(startPos.row);

            // Skip normal error processing
            continue;
          }

          const funcName = errorText.match(/(\w+)\s*\(/)?.[1];
          if (funcName) {
            message = t("editorPanel.pythonSyntaxErrors.unknownFunction", {
              name: funcName,
            });
          }
        }
        // New case: Check for missing commas in lists, tuples, or dictionaries
        else if (
          // Check if the parent is a list, tuple, dictionary, set or parenthesized expression (which could be a tuple)
          parent &&
          ["list", "tuple", "dictionary", "set", "parenthesized_expression"].includes(parent.type)
        ) {
          // Check for common missing comma patterns
          const prevItem = prevSibling;
          const nextItem = nextSibling;

          // If we have a literal or identifier directly followed by another without a comma
          if (
            prevItem &&
            nextItem &&
            // Check if previous sibling is a value
            ["string", "integer", "float", "identifier", "true", "false", "none"].includes(prevItem.type) &&
            // Check if next sibling is a value or closing bracket
            ["string", "integer", "float", "identifier", "true", "false", "none", "]", ")", "}"].includes(nextItem.type)
          ) {
            // We likely have a missing comma
            let containerType = parent.type;

            // Map parenthesized_expression to tuple when it appears to be a tuple
            if (containerType === "parenthesized_expression") {
              // If there are multiple values inside parentheses, it's likely a tuple
              containerType = "tuple";
            }

            const containerName = {
              "list": t("editorPanel.pythonSyntaxErrors.containerTypes.list", { defaultValue: "list" }),
              "tuple": t("editorPanel.pythonSyntaxErrors.containerTypes.tuple", { defaultValue: "tuple" }),
              "dictionary": t("editorPanel.pythonSyntaxErrors.containerTypes.dictionary", { defaultValue: "dictionary" }),
              "set": t("editorPanel.pythonSyntaxErrors.containerTypes.set", { defaultValue: "set" })
            }[containerType] || t("editorPanel.pythonSyntaxErrors.containerTypes.collection", { defaultValue: "collection" });

            message = t("editorPanel.pythonSyntaxErrors.missingComma", {
              containerName: containerName,
              defaultValue: `Missing comma in ${containerName}`
            });

            // Calculate the exact range to highlight - only include the two items with missing comma between them
            const newStartIndex = prevItem.startIndex;
            let newEndIndex = nextItem.endIndex;

            // Add this custom error directly
            problems.push({
              message,
              severity: "error",
              from: newStartIndex,
              to: newEndIndex,
              context: {
                row: startPos.row,
                column: startPos.column,
                text: code.slice(newStartIndex, newEndIndex),
              },
            });

            // Mark this line as handled
            handledLines.add(startPos.row);

            // Skip normal error processing
            continue;
          }
          // Special handling for dictionaries with missing comma between key-value pairs
          else if (parent.type === "dictionary") {
            // Check for missing comma between key-value pairs pattern
            // For dict {"key": "value" "key2": "value2"}, the key2 would be the sibling after "value"
            if (prevItem &&
                ["string", "integer", "float", "identifier", "true", "false", "none"].includes(prevItem.type) &&
                nextItem &&
                (nextItem.type === "string" || nextItem.type === "identifier")) {
              // Missing comma between string value and next key
              const containerName = t("editorPanel.pythonSyntaxErrors.containerTypes.dictionary",
                { defaultValue: "dictionary" });

              message = t("editorPanel.pythonSyntaxErrors.missingCommaBetweenPairs", {
                containerName: containerName,
                defaultValue: `Missing comma between key-value pairs in ${containerName}`
              });

              // Extend the highlighting to include the value and the next key, but not beyond
              const newStartIndex = prevItem.startIndex;
              const newEndIndex = nextItem.endIndex;

              // Add this custom error directly
              problems.push({
                message,
                severity: "error",
                from: newStartIndex,
                to: newEndIndex,
                context: {
                  row: startPos.row,
                  column: startPos.column,
                  text: code.slice(newStartIndex, newEndIndex),
                },
              });

              // Mark this line as handled
              handledLines.add(startPos.row);

              // Skip normal error processing
              continue;
            }
            // Also check for case when we have a pair followed by another key without comma
            else if (prevItem &&
                    prevItem.type === "pair" &&
                    nextItem &&
                    (nextItem.type === "string" || nextItem.type === "identifier")) {

              const containerName = t("editorPanel.pythonSyntaxErrors.containerTypes.dictionary",
                { defaultValue: "dictionary" });

              message = t("editorPanel.pythonSyntaxErrors.missingCommaBetweenPairs", {
                containerName: containerName,
                defaultValue: `Missing comma between key-value pairs in ${containerName}`
              });

              // Calculate the exact highlighting range
              // Try to get just the value part of the previous pair, and the key of the next pair
              let newStartIndex = prevItem.startIndex;
              const newEndIndex = nextItem.endIndex;

              // Add this custom error directly
              problems.push({
                message,
                severity: "error",
                from: newStartIndex,
                to: newEndIndex,
                context: {
                  row: startPos.row,
                  column: startPos.column,
                  text: code.slice(newStartIndex, newEndIndex),
                },
              });

              // Mark this line as handled
              handledLines.add(startPos.row);

              // Skip normal error processing
              continue;
            }
          }
        }
        // Case 2: Check for unopened/unclosed parentheses/brackets/braces
        else if (errorText.includes("(") && !errorText.includes(")")) {
          const hasOpenParen = lineContent.indexOf("(") !== -1;
          const hasCloseParen = lineContent.indexOf(")") !== -1;

          if (hasOpenParen && !hasCloseParen) {
            message = t(
              "editorPanel.pythonSyntaxErrors.missingClosingParenthesis",
            );
          }
        } else if (errorText.includes(")") && !errorText.includes("(")) {
          message = t(
            "editorPanel.pythonSyntaxErrors.missingOpeningParenthesis",
          );
        } else if (errorText.includes("[") && !errorText.includes("]")) {
          message = t("editorPanel.pythonSyntaxErrors.missingClosingBracket");
        } else if (errorText.includes("]") && !errorText.includes("[")) {
          message = t("editorPanel.pythonSyntaxErrors.missingOpeningBracket");
        } else if (errorText.includes("{") && !errorText.includes("}")) {
          message = t("editorPanel.pythonSyntaxErrors.missingClosingBrace");
        } else if (errorText.includes("}") && !errorText.includes("{")) {
          message = t("editorPanel.pythonSyntaxErrors.missingOpeningBrace");
        }
        // Case 3: Check for missing decorator symbol
        else if (
          prevSibling &&
          prevSibling.type === "identifier" &&
          (errorText.trim() === "" || errorText.trim() === ":")
        ) {
          // Check if this could be a missing decorator symbol
          const prevLine = code.split("\n")[startPos.row - 1] || "";
          if (!prevLine.trim().startsWith("@")) {
            message = t("editorPanel.pythonSyntaxErrors.missingDecorator");
          }
        }
        // Case 4: Check for missing colon
        else if (
          // Check if this is a control structure missing a colon
          lineContent.match(/^\s*(if|for|while|else|elif|def|class)(\s+|$)/) &&
          !lineContent.includes(":")
        ) {
          // This is a control structure line without a colon
          message = t("editorPanel.pythonSyntaxErrors.missingColon");
          hasMissingColonError = true;
          // Make sure we add the correct row number
          handledLines.add(startPos.row);

          // Store this error directly to ensure it gets highlighted
          problems.push({
            message,
            severity: "error",
            from: errorNode.startIndex,
            to: errorNode.endIndex,
            context: {
              row: startPos.row,
              column: startPos.column,
              text: errorText,
              isMissingColon: true, // Flag to identify this as a colon error
              lineNumber: startPos.row // Store the line number for highlighting
            },
          });

          // Skip the normal error processing for this case
          continue;
        }
        // Original Case 4: Check parent node type for missing colon
        else if (
          parent &&
          [
            "block",
            "function_definition",
            "class_definition",
            "if_statement",
            "for_statement",
            "while_statement",
          ].includes(parent.type)
        ) {
          const nodeText = code.slice(parent.startIndex, parent.endIndex);
          if (!nodeText.includes(":")) {
            message = t("editorPanel.pythonSyntaxErrors.missingColon");
            hasMissingColonError = true;
            // Get the actual row of the parent statement
            const parentLines = code.substring(0, parent.startIndex).split("\n");
            handledLines.add(parentLines.length - 1);
          }
        }
        // Add specific check for function definition with missing colon
        else if (errorText.match(/def\s+\w+\s*\([^:]*\)\s*$/)) {
          message = t("editorPanel.pythonSyntaxErrors.missingColon");
          hasMissingColonError = true;
          handledLines.add(startPos.row);

          // Store this error directly to ensure it gets highlighted
          problems.push({
            message,
            severity: "error",
            from: errorNode.startIndex,
            to: errorNode.endIndex,
            context: {
              row: startPos.row,
              column: startPos.column,
              text: errorText,
              isMissingColon: true, // Flag to identify this as a colon error
              lineNumber: startPos.row // Store the line number for highlighting
            },
          });

          // Skip the normal error processing for this case
          continue;
        }
        // Case 5: Check for indentation issues (only if none of the above)
        else if (
          (startPos.column === 0 ||
            (prevSibling && prevSibling.endPosition.row !== startPos.row)) &&
          !errorText.match(/\w+\s*\(/) && // Not a function call
          !errorText.match(/[()[\]{}]/) // Not related to brackets/braces/parentheses
        ) {
          message = t("editorPanel.pythonSyntaxErrors.indentationIssue");
        }
        // Case 6: Check for missing quotes
        else if (
          errorText.includes('"') &&
          errorText.split('"').length % 2 === 0
        ) {
          message = t(
            "editorPanel.pythonSyntaxErrors.missingClosingDoubleQuote",
          );
        } else if (
          errorText.includes("'") &&
          errorText.split("'").length % 2 === 0
        ) {
          message = t(
            "editorPanel.pythonSyntaxErrors.missingClosingSingleQuote",
          );
        }
        // Case 7: Check for potential invalid syntax in function calls
        else if (
          parent &&
          parent.type === "call" &&
          !message.includes("Missing")
        ) {
          message = t("editorPanel.pythonSyntaxErrors.functionCallSyntaxError");
        }
        // Case 8: Check for potential keyword issues
        else if (prevSibling && prevSibling.type === "keyword") {
          const keyword = code.slice(
            prevSibling.startIndex,
            prevSibling.endIndex,
          );
          message = t(
            "editorPanel.pythonSyntaxErrors.syntaxErrorAfterKeyword",
            { keyword },
          );
        }

        // Skip generic syntax errors for lines inside functions with missing colons
        // This prevents the extra error highlighting on indented lines within a function
        if (hasMissingColonError &&
            message === t("editorPanel.pythonSyntaxErrors.default") &&
            // Check if we're at the end of a block that might be caused by a missing colon
            errorText.trim().startsWith("\n") &&
            // Verify if there are any control structures (if, def, etc.) in previous lines
            code.split('\n').some(line =>
              line.match(/^\s*(if|for|while|else|elif|def|class)(\s+|$)/) && !line.includes(':')
            )) {
          continue;
        }

        // Skip duplicate errors on same line (e.g., when missing colon causes multiple errors)
        if (handledLines.has(startPos.row)) {
          continue;
        }

        // Log context for debugging
        console.log("Error context:", {
          errorText,
          lineContent,
          parentType: parent?.type,
          prevSiblingType: prevSibling?.type,
          nextSiblingType: nextSibling?.type,
          position: `${startPos.row}:${startPos.column}-${endPos.row}:${endPos.column}`,
          message: message,
        });

        problems.push({
          message,
          severity: "error",
          from: errorNode.startIndex,
          to: errorNode.endIndex,
          context: {
            row: startPos.row,
            column: startPos.column,
            text: errorText,
          },
        });

        // Mark this line as handled
        handledLines.add(startPos.row);
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
      let className = "problem-marker";
      if (problem.severity === "error") {
        className += " problem-error";
      } else if (problem.severity === "warning") {
        className += " problem-warning";
      }

      // Handle empty error ranges (zero width)
      let from = problem.from;
      let to = problem.to;

      // Check if this is a multi-line error
      const isMultiLineError =
        state.doc.lineAt(from).number !== state.doc.lineAt(to).number;
      let targetLine;

      if (isMultiLineError) {
        // For multi-line errors, try to identify the line with the actual error

        // For missing colons, look for line with def/if/for/while/etc
        if (problem.message.includes("Missing colon")) {
          // Search through each line in the error range to find a control structure
          for (
            let line = state.doc.lineAt(from);
            line.number <= state.doc.lineAt(to).number;
            line = state.doc.line(line.number + 1)
          ) {
            const lineContent = line.text;
            // Check if this line looks like it should have a colon
            if (
              lineContent.match(
                /^\s*(if|for|while|else|elif|def|class)(\s+|\()/,
              )
            ) {
              targetLine = line;
              break;
            }
          }
        }
        // For missing quotes, look for a line with an odd number of quote characters
        else if (
          problem.message.includes("Missing") &&
          (problem.message.includes("quote") ||
            problem.message.includes("quotation"))
        ) {
          // Check each line for unbalanced quotes
          for (
            let line = state.doc.lineAt(from);
            line.number <= state.doc.lineAt(to).number;
            line = state.doc.line(line.number + 1)
          ) {
            const lineContent = line.text;
            // If this line has an odd number of quotes, it's likely the problematic line
            const singleQuoteCount = (lineContent.match(/'/g) || []).length;
            const doubleQuoteCount = (lineContent.match(/"/g) || []).length;

            if (singleQuoteCount % 2 !== 0 || doubleQuoteCount % 2 !== 0) {
              targetLine = line;
              break;
            }
          }
        }
        // For function definition errors
        else if (
          problem.message.includes("function") ||
          (problem.context?.text && problem.context.text.includes("def "))
        ) {
          // Look for the line with 'def' keyword
          for (
            let line = state.doc.lineAt(from);
            line.number <= state.doc.lineAt(to).number;
            line = state.doc.line(line.number + 1)
          ) {
            if (line.text.match(/^\s*def\s+\w+/)) {
              targetLine = line;
              break;
            }
          }
        }

        // If we've identified a specific target line, use it
        if (targetLine) {
          from = targetLine.from;
          to = targetLine.from + targetLine.length;
        } else {
          // Default: use the starting line
          const errorLine = state.doc.lineAt(from);
          from = errorLine.from;
          to = errorLine.from + errorLine.length;
        }
      } else {
        // For single-line errors, use the current line
        const errorLine = state.doc.lineAt(from);
        targetLine = errorLine;
      }

      // If the error is an empty string or just whitespace, highlight a reasonable area
      if (from === to || state.doc.sliceString(from, to).trim() === "") {
        // For decorator errors, highlight the identifier before
        if (problem.message.includes("decorator")) {
          from = targetLine.from;
          to = targetLine.from + targetLine.length;
        } else {
          // For other cases, highlight at least one character
          to = from + 1;
        }
      }

      // For indentation errors, highlight the whole line
      if (problem.message.includes("Indentation")) {
        from = targetLine.from;
        to = targetLine.from + targetLine.length;
      }

      // For missing colon errors, only highlight the line with the missing colon
      if (problem.message.includes("Missing colon")) {
        from = targetLine.from;
        to = targetLine.from + targetLine.length;
      }

      // For missing quote errors, only highlight the current line
      if (
        problem.message.includes("Missing") &&
        (problem.message.includes("quote") ||
          problem.message.includes("quotation"))
      ) {
        from = targetLine.from;
        to = targetLine.from + targetLine.length;
      }

      // Get the line text and adjust the highlighting to exclude comments
      const lineText = state.doc.lineAt(from).text;

      // Find comment start position (either # or """) in the line
      const hashCommentPos = lineText.indexOf("#");
      const tripleQuotePos = lineText.indexOf('"""');

      // Get the earlier of the two comment types (if either exists)
      let commentPos = -1;
      if (hashCommentPos !== -1 && tripleQuotePos !== -1) {
        commentPos = Math.min(hashCommentPos, tripleQuotePos);
      } else if (hashCommentPos !== -1) {
        commentPos = hashCommentPos;
      } else if (tripleQuotePos !== -1) {
        commentPos = tripleQuotePos;
      }

      // If we found a comment in this line, adjust 'to' position to exclude it
      if (commentPos !== -1) {
        // First, find the first non-whitespace character before the comment
        let trimPos = commentPos;
        while (trimPos > 0 && /\s/.test(lineText[trimPos - 1])) {
          trimPos--;
        }

        // Adjust 'to' to exclude comment and preceding whitespace
        const lineFrom = state.doc.lineAt(from).from;
        const adjustedTo = lineFrom + trimPos;

        // Only adjust if we're not going to make the highlight empty
        if (adjustedTo > from) {
          to = adjustedTo;
        }
      }

      // Get line number for tooltip positioning
      const lineNumber = state.doc.lineAt(from).number - 1; // Convert to 0-based

      // Create a shorter error type for the data attribute
      // Only take the first word, which is usually "Missing", "Indentation", "Syntax", etc.
      const errorType = problem.message.split(":")[0].trim().toLowerCase();

      // Extract just the helpful message part
      const friendlyMessage = problem.message;

      // Determine if we need to force tooltip position based on line position
      const totalLines = state.doc.lines;
      let linePosition = "";

      // For errors on the last few lines, force tooltips to appear above
      if (lineNumber >= totalLines - 3 && lineNumber >= 2) {
        linePosition = "top";
      }
      // For errors on the top few lines, force tooltips to appear below
      else if (lineNumber < 2) {
        linePosition = "bottom";
      }

      // Debug logging
      console.log(
        `Creating error marker: type=${errorType}, message="${friendlyMessage}", position=${linePosition}`,
      );

      return Decoration.mark({
        class: className,
        attributes: {
          "data-message": friendlyMessage,
          "data-error-type": errorType,
          "data-line": lineNumber.toString(),
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
