// To be removed once Python FEM is added
export const getFriendlyErrorMessage = async () => {
  return Promise.resolve({
    title: "This variable doesn't exist yet",
    summary: `Your code uses the variable "total", but it hasn't been created yet. Check line 3 in main.py. If you meant to print the text total, put it in double quotes.`,
  });
};
