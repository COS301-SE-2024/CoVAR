describe('Organisation E2E Tests', () => {
    beforeEach(() => {
      // Login
      cy.visit('/login') 
      cy.get('input[name="email"]', { timeout: 4000 }).type(Cypress.env('client_username'), { log: false })
      cy.get('input[name="password"]').type(Cypress.env('client_password'), { log: false }) 
      cy.get('button[type="submit"]').click() 
  
      cy.wait(4500)
    })
  
    it('create an organisation, add a member, change the name, remove a member', () => {
      //Navigate to the organisation page
      cy.get('[test-id="organisationLink"]').click();

      //Create an organisation
      cy.get('input[name="new-organisation-name"]', { timeout: 4000 }).type('Test Organization');
      cy.contains('button', 'Create Organisation').click();

      cy.get('.MuiDataGrid-row--firstVisible > [data-field="email"]').should('have.text', Cypress.env('client_username'));
    
      // Invite a member to the organisation
      cy.get("#email").type(Cypress.env('va_username'), { force: true });
      cy.contains('button', 'Invite Member').click({ force: true });

      // Check that the invite was sent successfully
      cy.get('body').then(($body) => {
        if ($body.find('Typography[variant="body2"]').length > 0) {
          cy.get('Typography[variant="body2"]')
            .should('have.text', 'Invite sent successfully.');
        }
      });

      //Change the organisation name
      cy.get('#organisation-name').type("Another name");
      cy.contains('button', 'Change Name').click();

      cy.contains('h4', 'Another name').should('exist');

      //Remove a member of the organisation
      cy.get('.MuiDataGrid-row--lastVisible > [data-field="actions"] > .MuiButtonBase-root').click();

      cy.get('.MuiTablePagination-displayedRows').should('have.text', '1–1 of 1');
    })
})