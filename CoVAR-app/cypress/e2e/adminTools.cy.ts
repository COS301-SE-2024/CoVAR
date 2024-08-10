describe('Admin tools E2E Tests', () => {
    beforeEach(() => {
        cy.visit('/login') 
    })
  
    it('client should not see admin tools or evaluate page', () => {
        // Login
        cy.get('input[name="email"]').type(Cypress.env('client_username'), { log: false });
        cy.get('input[name="password"]').type(Cypress.env('client_password'), { log: false }); 
        cy.get('button[type="submit"]').click(); 
  
        // Navigate to the admin tools page
        cy.get('[test-id="adminToolsLink"]').should('not.exist');
        cy.get('[test-id="evaluateLink"]').should('not.exist');

        // Logout
        cy.get('[test-id="logoutButton"]').click();
    });

    it('demote a va to client and promote again', () => {
        // Login
        cy.get('input[name="email"]').type(Cypress.env('admin_username'), { log: false });
        cy.get('input[name="password"]').type(Cypress.env('admin_password'), { log: false }); 
        cy.get('button[type="submit"]').click(); 

        // Navigate to the admin tools page
        cy.get('[test-id="adminToolsLink"]').click();

        // Demote and promote
        cy.get('.MuiDataGrid-root .MuiDataGrid-row').contains(Cypress.env('va_username')).closest('.MuiDataGrid-row').contains('button', 'Unassign').click();

        // Confirm unassignment dialog appears
        cy.get('.MuiDialog-root').contains('Are you sure you want to unassign').should('exist');
        cy.get('.MuiDialog-root').contains('Confirm').click();

        cy.get('.MuiDataGrid-root .MuiDataGrid-row').contains(Cypress.env('va_username')).closest('.MuiDataGrid-row').contains('client').should('exist');

        cy.get('.MuiDataGrid-root .MuiDataGrid-row').contains(Cypress.env('va_username')).closest('.MuiDataGrid-row').contains('button', 'Assign VA').click();

        // Confirm assignment dialog appears
        cy.get('.MuiDialog-root').contains('Are you sure you want to assign').should('exist');
        cy.get('.MuiDialog-root').contains('Confirm').click();

        cy.get('.MuiDataGrid-root .MuiDataGrid-row').contains(Cypress.env('va_username')).closest('.MuiDataGrid-row').contains('va').should('exist');
    });

    it('assign a client to a va', () => {
        // Login as admin
        cy.get('input[name="email"]').type(Cypress.env('admin_username'), { log: false });
        cy.get('input[name="password"]').type(Cypress.env('admin_password'), { log: false }); 
        cy.get('button[type="submit"]').click(); 

        // Navigate to the admin tools page
        cy.get('[test-id="adminToolsLink"]').click();

        // Assign client to va
        cy.get('.MuiDataGrid-root .MuiDataGrid-row').contains(Cypress.env('va_username')).closest('.MuiDataGrid-row').contains('button', 'Assign Client').click();
        
        // Verify the Assign Client dialog is open
        cy.get('.MuiDialog-root').contains('Assign Client').should('exist');
        
        // Type in the client username
        cy.get('.MuiFormControl-root > .MuiInputBase-root').type(Cypress.env('client_username') + '{enter}', { log: false });
        cy.get('.MuiDialog-root').contains('Confirm').click(); // Confirm assignment

        // Logout
        cy.get('[test-id="logoutButton"]').click();

        // Login as va
        cy.get('input[name="email"]').type(Cypress.env('va_username'), { log: false });
        cy.get('input[name="password"]').type(Cypress.env('va_password'), { log: false }); 
        cy.get('button[type="submit"]').click(); 

        // Navigate to evaluate page
        cy.get('[test-id="evaluateLink"]').click();
        cy.contains(Cypress.env('client_username')).should('exist');
    });

    it('remove a client from a va', () => {
        // Login as admin
        cy.get('input[name="email"]').type(Cypress.env('admin_username'), { log: false });
        cy.get('input[name="password"]').type(Cypress.env('admin_password'), { log: false }); 
        cy.get('button[type="submit"]').click(); 

        // Navigate to the organisation page
        cy.get('[test-id="adminToolsLink"]').click();

        // Remove client from va
        cy.get('.MuiDataGrid-root .MuiDataGrid-row').contains(Cypress.env('va_username')).closest('.MuiDataGrid-row').contains('button', 'Remove Client').click();
        
        // Confirm removal dialog appears
        cy.get('.MuiDialog-root').contains('Are you sure you want to unassign').should('exist');
        cy.get('.MuiDialog-root').contains('Confirm').click();

        cy.contains('Successfully unassigned').should('exist');
    });
});
