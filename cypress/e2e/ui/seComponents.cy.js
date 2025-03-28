describe('Editor Web Components', () => {
  context('seButton', () => {
    it('renders and reacts to click', () => {
      const onClick = cy.stub().as('seButtonClick')

      cy.document().then(doc => {
        const el = doc.createElement('se-button')
        el.addEventListener('click', onClick)
        doc.body.appendChild(el)
      })

      cy.get('se-button').should('exist').click({ force: true })
      cy.get('@seButtonClick').should('have.been.called')
    })
  })

  context('seFlyingButton', () => {
    it('renders and reacts to click', () => {
      const onClick = cy.stub().as('seFlyingClick')
      cy.document().then(doc => {
        const el = doc.createElement('se-flying-button')
        el.addEventListener('click', onClick)
        doc.body.appendChild(el)
      })

      cy.get('se-flying-button').should('exist').click({ force: true })
      cy.get('@seFlyingClick').should('have.been.called')
    })
  })

  context('seExplorerButton', () => {
    it('renders and reacts to click', () => {
      const onClick = cy.stub().as('seExplorerClick')
      cy.document().then(doc => {
        const el = doc.createElement('se-explorer-button')
        el.addEventListener('click', onClick)
        doc.body.appendChild(el)
      })

      cy.get('se-explorer-button').should('exist').click({ force: true })
      cy.get('@seExplorerClick').should('have.been.called')
    })
  })
})
