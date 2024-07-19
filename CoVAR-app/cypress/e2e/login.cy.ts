describe('Login E2E Tests', () => {
    beforeEach(() => {
      cy.visit('/login') 
    })
  
    it('displays an error message with incorrect credentials', () => {
      cy.get('input[name="email"]', { timeout: 4000 }).type('wronguser@something.com')
      cy.get('input[name="password"]').type('wrongpassword')
      cy.get('button[type="submit"]').click()
  
      cy.wait(1000)
      cy.get('#error').should("have.text", 'Failed to sign in. Please check your credentials.') 
    })
  
    it('successfully logs in with correct credentials', () => {
      cy.get('input[name="email"]', { timeout: 4000 }).type(Cypress.env('client_username'), { log: false })
      cy.get('input[name="password"]').type(Cypress.env('client_password'), { log: false }) 
      cy.get('button[type="submit"]').click() 
  
      cy.wait(2500)
      cy.url().should('include', '/dashboard') 
    })
  
  })