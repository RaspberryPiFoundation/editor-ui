const populateMarkdownTemplate = (markdown, t) => {
  return markdown.replace(/{{(.*?)}}/g, (_, key) => {
    const translation = t(key);
    return translation ? translation : `{{${key}}}`;
  });
};

export default populateMarkdownTemplate;
