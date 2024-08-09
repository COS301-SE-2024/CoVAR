describe('Sign Up E2E Tests', () => {
    beforeEach(() => {
      cy.visit('/login') 
      cy.get("#signupToggle").click()
    })
  
    it('displays an error message with duplicate email', () => {
      cy.get('input[name="email"]', { timeout: 4000 }).type(Cypress.env('client_username'), { log: false })
      cy.get('input[name="password"]').type('newPassword')
      cy.get('input[name="passwordConfirm"]').type('newPassword')
      cy.get('button[type="submit"]').click()
  
      cy.wait(1000)
      cy.get('#error').should("have.text", 'Email already in use.') 
    })
  
    it('successfully signs up with correct credentials', () => {
      const unixTimestamp = Math.floor(Date.now() / 1000);

      cy.get('input[name="email"]', { timeout: 4000 }).type(unixTimestamp + 'cypress' + Cypress.env('client_username'), { log: false })
      cy.get('input[name="password"]').type(Cypress.env('client_password'), { log: false }) 
      cy.get('input[name="passwordConfirm"]').type(Cypress.env('client_password'), { log: false }) 
      cy.get('button[type="submit"]').click() 
  
      cy.wait(3500)
      cy.url().should('include', '/lounge') 
    })
  
  })