describe('Sign Up E2E Tests', () => {
    beforeEach(() => {
      cy.visit('/login') 
      cy.get("#signupToggle").click()
    })
  
    it('displays an error message with duplicate email', () => {
      cy.get('input[name="email"]', { timeout: 4000 }).type(Cypress.env('client_username'), { log: false })
      cy.get('input[name="password"]').type('newPassword@123')
      cy.get('input[name="passwordConfirm"]').type('newPassword@123')
      cy.get('button[type="submit"]').click()
  
      cy.contains('Email is already in use. Please use a different email address.', { timeout: 2000 }).should('be.visible');


    })
  
    it('successfully signs up with correct credentials', () => {
      const unixTimestamp = Math.floor(Date.now() / 1000);

      cy.get('input[name="email"]', { timeout: 4000 }).type(unixTimestamp + 'cypress' + Cypress.env('client_username'), { log: false })
      cy.get('input[name="password"]').type('newPassword@123')
      cy.get('input[name="passwordConfirm"]').type('newPassword@123')
      cy.get('button[type="submit"]').click() 
  
      cy.wait(6000)
      cy.url().should('include', '/lounge') 
    })
  
  })