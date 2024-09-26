describe('Admin tools E2E Tests', () => {
    beforeEach(() => {
        cy.visit('/login')
    })

    it('client should not see admin tools or evaluate page', () => {
        cy.wait(10000);

        // Login
        cy.get('input[name="email"]', { timeout: 10000 }).type(Cypress.env('client_username'), { log: false })
        cy.get('input[name="password"]').type(Cypress.env('client_password'), { log: false })
        cy.get('button[type="submit"]').click()
        cy.wait(10000);


        //Navigate to the admin tools page
        cy.get('[test-id="adminToolsLink"]', { timeout: 4500 }).should('not.exist');
        cy.get('[test-id="evaluateLink"]').should('not.exist');

        //Logout

        cy.wait(2000);
        cy.get('[test-id="logoutButton"]', { timeout: 8000 }).click();
    })

    it('demote a va to client and promote again', () => {
        cy.wait(10000);
        cy.wait(10000);

        // Login
        cy.get('input[name="email"]', { timeout: 10000 }).type(Cypress.env('admin_username'), { log: false })
        cy.get('input[name="password"]').type(Cypress.env('admin_password'), { log: false })
        cy.get('button[type="submit"]').click()
        cy.wait(10000);
        cy.wait(10000);

        //Navigate to the admin tools page
        cy.get('[test-id="adminToolsLink"]', { timeout: 4500 }).click();
        cy.wait(10000);

        //Demote and promote
        cy.get('.MuiDataGrid-root .MuiDataGrid-row', { timeout: 8000 }).contains(Cypress.env('va_username'), { log: false }).closest('.MuiDataGrid-row').contains('button', 'Unassign').click();
        cy.get('.MuiDialog-root').should('exist');
        cy.get('.MuiDialog-root').contains('Confirm').click();
        cy.get('.MuiDataGrid-root .MuiDataGrid-row').contains(Cypress.env('va_username'), { log: false }).closest('.MuiDataGrid-row').contains('client').should('exist');
        cy.get('.MuiDataGrid-root .MuiDataGrid-row').contains(Cypress.env('va_username'), { log: false }).closest('.MuiDataGrid-row').contains('button', 'Assign VA').click();
        cy.get('.MuiDialog-root').should('exist');
        cy.get('.MuiDialog-root').contains('Confirm').click();
        cy.get('.MuiDataGrid-root .MuiDataGrid-row').contains(Cypress.env('va_username'), { log: false }).closest('.MuiDataGrid-row').contains('va').should('exist');
    })

    it('assign a client to a va', () => {
        cy.wait(10000);

        // Login as admin
        cy.get('input[name="email"]', { timeout: 10000 }).type(Cypress.env('admin_username'), { log: false })
        cy.get('input[name="password"]').type(Cypress.env('admin_password'), { log: false })
        cy.get('button[type="submit"]').click()
        cy.wait(10000);

        //Navigate to the admin tools page
        cy.get('[test-id="adminToolsLink"]', { timeout: 4500 }).click();
        cy.wait(10000);

        // Assign client to va
        cy.get('.MuiDataGrid-root .MuiDataGrid-row')
            .contains(Cypress.env('va_username'), { log: false })
            .closest('.MuiDataGrid-row')
            .contains('button', 'Assign Client')
            .click();
            cy.wait(10000);

        cy.get('.MuiDialog-root').should('exist');
        const clientUsername = Cypress.env('client_username');
        cy.wait(10000);

        // Type part of the client username and immediately look for the options
        cy.get('.MuiFormControl-root > .MuiInputBase-root')
            .type(clientUsername.charAt(0))
            .wait(100)
            .then(() => {
                // Select the specific client_username from the Autocomplete options
                cy.get('.MuiAutocomplete-listbox').contains(clientUsername).click();
            });
            cy.wait(10000);

        // Ensure the assign button is visible and click it
        cy.get('.MuiDialog-root').find('button').contains('Assign').click({ force: true });


        cy.wait(10000);

        //Logout
        cy.get('[test-id="logoutButton"]').click();
        cy.wait(10000);

        //Login as va
        cy.get('input[name="email"]', { timeout: 10000 }).type(Cypress.env('va_username'), { log: false })
        cy.get('input[name="password"]').type(Cypress.env('va_password'), { log: false })
        cy.get('button[type="submit"]').click()

        //Navigate to evaulate page
        cy.get('[test-id="evaluateLink"]', { timeout: 4500 }).click();
        cy.contains(Cypress.env('client_username')).should('exist');
    })

    it('remove a client from a va', () => {
        cy.wait(10000);
        // Login as admin
        cy.get('input[name="email"]', { timeout: 10000 }).type(Cypress.env('admin_username'), { log: false })
        cy.get('input[name="password"]').type(Cypress.env('admin_password'), { log: false })
        cy.get('button[type="submit"]').click()
        cy.wait(10000);
        cy.wait(10000);

        //Navigate to the organisation page
        cy.get('[test-id="adminToolsLink"]', { timeout: 4500 }).click();
        cy.wait(10000);

        //Remove client from va
        cy.get('.MuiDataGrid-root .MuiDataGrid-row').contains(Cypress.env('va_username'), { log: false }).closest('.MuiDataGrid-row').contains('button', 'Remove Client').click();
        cy.get('.MuiDialog-root').should('exist');
        const clientUsername = Cypress.env('client_username');
        cy.wait(10000);

        // Type part of the client username and immediately look for the options
        cy.get('.MuiFormControl-root > .MuiInputBase-root')
            .type(clientUsername.charAt(0))
            .wait(100)
            .then(() => {
                // Select the specific client_username from the Autocomplete options
                cy.get('.MuiAutocomplete-listbox').contains(clientUsername).click();
            });
            cy.wait(10000);

        // Ensure the assign button is visible and click it
        cy.get('.MuiDialog-root').find('button').contains('Unassign').click({ force: true });
        cy.contains('Successfully unassigned', { timeout: 2000 }).should('exist');
    })
})