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
  cy.visit(baseUrl)
  cy.get('div[class=cm-content]').invoke('text', '<p class="test">hello world</p>')
  getIframeBody().find('.test').should('include.text', 'hello world')
})



