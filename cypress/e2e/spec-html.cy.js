const baseUrl = 'localhost:3000/en/projects/blank-html-starter'

const getIframeDocument = () => {
  return cy
  .get('iframe[class=htmlrunner-iframe]')
  .its('0.contentDocument').should('exist')
}

const getIframeBody = () => {
    return getIframeDocument()
    .its('body').should('not.be.undefined')
    .then(cy.wrap)
}

it('renders the html runner', () => {
  cy.visit(baseUrl)
  cy.get('.htmlrunner-container').should('be.visible')
})

it('updates the preview after a change', () => {
  localStorage.clear()
  cy.visit(baseUrl)
  getIframeBody().should('not.include.text', 'hello world')
  cy.get('div[class=cm-content]').invoke('text', '<p>hello world</p>')
  cy.wait(2050)
  getIframeBody().find('p').should('include.text', 'hello world')
})



