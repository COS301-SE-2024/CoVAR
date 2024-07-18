describe('Organisation E2E Tests', () => {
    beforeEach(() => {
        cy.visit('/login') 
    })
  
    it('client should not see admin tools or evaluate page', () => {
      // Login
      cy.get('input[name="email"]', { timeout: 4000 }).type(Cypress.env('client_username'), { log: false })
      cy.get('input[name="password"]').type(Cypress.env('client_password'), { log: false }) 
      cy.get('button[type="submit"]').click() 
  
      //Navigate to the admin tools page
      cy.get('[test-id="adminToolsLink"]', { timeout: 4500 }).should('not.exist');
      cy.get('[test-id="evaluateLink"]').should('not.exist');

      //Logout
      cy.get('[test-id="logoutButton"]', { timeout: 4500 }).click();
    })

    it('demote a va to client and promote again', () => {
        // Login
        cy.get('input[name="email"]', { timeout: 4000 }).type(Cypress.env('admin_username'), { log: false })
        cy.get('input[name="password"]').type(Cypress.env('admin_password'), { log: false }) 
        cy.get('button[type="submit"]').click() 

        //Navigate to the admin tools page
        cy.get('[test-id="adminToolsLink"]', { timeout: 4500 }).click();

        //Demote and promote
        cy.get('.MuiDataGrid-root .MuiDataGrid-row').contains(Cypress.env('va_username'), { log: false }).closest('.MuiDataGrid-row').contains('button', 'Unassign').click();
        cy.get('.MuiDataGrid-root .MuiDataGrid-row').contains(Cypress.env('va_username'), { log: false }).closest('.MuiDataGrid-row').contains('client').should('exist');
        cy.get('.MuiDataGrid-root .MuiDataGrid-row').contains(Cypress.env('va_username'), { log: false }).closest('.MuiDataGrid-row').contains('button', 'Assign VA').click();
        cy.get('.MuiDataGrid-root .MuiDataGrid-row').contains(Cypress.env('va_username'), { log: false }).closest('.MuiDataGrid-row').contains('va').should('exist');
    })

    it('assign a client to a va', () => {
        // Login as admin
        cy.get('input[name="email"]', { timeout: 4000 }).type(Cypress.env('admin_username'), { log: false })
        cy.get('input[name="password"]').type(Cypress.env('admin_password'), { log: false }) 
        cy.get('button[type="submit"]').click() 

        //Navigate to the organisation page
        cy.get('[test-id="adminToolsLink"]', { timeout: 4500 }).click();

        //Assign client to va
        cy.get('.MuiDataGrid-root .MuiDataGrid-row').contains(Cypress.env('va_username'), { log: false }).closest('.MuiDataGrid-row').contains('button', 'Assign Client').click();
        cy.get('.MuiFormControl-root > .MuiInputBase-root').type(Cypress.env('client_username') + '{enter}', { log: false });

        //Logout
        cy.get('[test-id="logoutButton"]').click();

        //Login as va
        cy.get('input[name="email"]', { timeout: 4000 }).type(Cypress.env('va_username'), { log: false })
        cy.get('input[name="password"]').type(Cypress.env('va_password'), { log: false }) 
        cy.get('button[type="submit"]').click() 

        //Navigate to evaulate page
        cy.get('[test-id="evaluateLink"]', { timeout: 4500 }).click();
        cy.contains(Cypress.env('client_username')).should('exist');
    })

    it('remove a client from a va', () => {
        // Login as admin
        cy.get('input[name="email"]', { timeout: 4000 }).type(Cypress.env('admin_username'), { log: false })
        cy.get('input[name="password"]').type(Cypress.env('admin_password'), { log: false }) 
        cy.get('button[type="submit"]').click() 

        //Navigate to the organisation page
        cy.get('[test-id="adminToolsLink"]', { timeout: 4500 }).click();

        //Remove client from va
        cy.get('.MuiDataGrid-root .MuiDataGrid-row').contains(Cypress.env('va_username'), { log: false }).closest('.MuiDataGrid-row').contains('button', 'Un-Assign Client').click();
        cy.get('.MuiFormControl-root > .MuiInputBase-root').type(Cypress.env('client_username') + '{enter}', { log: false });

        cy.contains('Successfully unassigned', { timeout: 2000 }).should('exist');
    })
})