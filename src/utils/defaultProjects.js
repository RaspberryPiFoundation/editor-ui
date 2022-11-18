export const defaultPythonProject = {
  project_type: 'python',
  components: [
    { extension: 'py', name: 'main',
      content: "", index: 0, default: true },
  ]
}

export const defaultHtmlProject = {
  project_type: 'html',
  components: [
    { extension: 'html', name: 'index',
      content: "<html>\n  <head>\n    <link rel=\"stylesheet\" type=\"text/css\" href=\"style.css\">\n  </head> <body>\n    <h1>Heading</h1>\n    <p>Paragraph</p>\n  </body>\n</html>" },
    { extension: 'css', name: 'style', content: "h1 {\n  color: blue;\n}" },
    { extension: 'css', name: 'test', content: "p {\n  background-color: red;\n}" }
  ]
}
