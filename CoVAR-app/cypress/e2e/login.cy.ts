describe('Login E2E Tests', () => {
    beforeEach(() => {
      cy.visit('/login') 
    })
  
    it('displays the entire DOM for debugging', () => {
      cy.document().then((doc) => {
        const domString = doc.documentElement.outerHTML;
        cy.task('logDOM', domString);
      });
    });
  
    it('displays an error message with incorrect credentials', () => {
      cy.get('input[name="email"]', { timeout: 4000 }).type('wronguser@something.com')
      cy.get('input[name="password"]').type('wrongpassword')
      cy.get('button[type="submit"]').click()
  
      cy.wait(1000)
      cy.get('#error').should("have.text", 'Failed to sign in. Please check your credentials.') 
    })
  
    it('successfully logs in with correct credentials', () => {
      cy.get('input[name="email"]', { timeout: 4000 }).type('jfmalan1@gmail.com')
      cy.get('input[name="password"]').type('Password') 
      cy.get('button[type="submit"]').click() 
  
      cy.url().should('include', '/') 
    })
  
  })