describe('Organisation E2E Tests', () => {
  beforeEach(() => {
    // Login
    cy.visit('/login');
    cy.get('input[name="email"]', { timeout: 4000 }).type(Cypress.env('client_username'), { log: false });
    cy.get('input[name="password"]').type(Cypress.env('client_password'), { log: false });
    cy.get('button[type="submit"]').click();

    cy.wait(4500);
  });

  it('create an organisation', () => {
    // Navigate to the organisation page
    cy.get('[test-id="organisationLink"]').click();

    // Create an organisation
    cy.get('input[name="new-organisation-name"]', { timeout: 10000 }).type('Test Organization');
    cy.wait(5000);
    cy.contains('button', 'Create Organisation').click();

    // Check if the user is added automatically
    cy.get('.MuiDataGrid-row--firstVisible > [data-field="email"]').should('have.text', Cypress.env('client_username'));
  });

  it('invite a member to the organisation', () => {
    // Navigate to the organisation page
    cy.get('[test-id="organisationLink"]').click();

    // Invite a member
    cy.get("#email").type(Cypress.env('va_username'), { force: true });
    cy.contains('button', 'Invite Member').click({ force: true });

    // Check if the invite was sent successfully
    cy.get('body').then(($body) => {
      if ($body.find('Typography[variant="body2"]').length > 0) {
        cy.get('Typography[variant="body2"]').should('have.text', 'Invite sent successfully.');
      }
    });
  });

  it('accept the invite as the invited user', () => {
    // Logout as the original user
    cy.wait(2000);
    cy.get('[test-id="logoutButton"]', { timeout: 8000 }).click();

    // Login as the invited user
    cy.get('input[name="email"]').type(Cypress.env('va_username'), { log: false });
    cy.get('input[name="password"]').type(Cypress.env('va_password'), { log: false });
    cy.get('button[type="submit"]').click();
    cy.wait(4500);

    // Navigate to the organisation page
    cy.get('[test-id="organisationLink"]').click();
    cy.wait(2000);

    // Accept the invite
    cy.contains('Pending Invites').should('be.visible');
    const organizationName = 'Another name';
    cy.contains('p.MuiTypography-root.MuiTypography-body1', 'Another name')
        .should('be.visible') // Check that the organization name is visible
        .then(($orgName) => {
            // Navigate to the parent container of the organization name
            const $parentContainer = $orgName.closest('div.MuiBox-root.css-1c00y6l');

            // Find the accept invite button within the same parent container
            cy.wrap($parentContainer).find('button.MuiIconButton-colorPrimary')
                .should('be.visible') // Ensure the button is visible
                .click(); // Click the button
              });
  }); 

  it('change the organisation name', () => {
    // Navigate to the organisation page
    cy.get('[test-id="organisationLink"]').click();

    // Change the organisation name
    cy.get('#organisation-name').type("Another name");
    cy.contains('button', 'Change Name').click();

    // Verify that the name has changed
    cy.contains('h4', 'Another name').should('exist');
  });

  it('remove a member from the organisation', () => {
    // Navigate to the organisation page
    cy.get('[test-id="organisationLink"]').click();

    // Remove the invited user
    cy.get('.MuiDataGrid-row--lastVisible > [data-field="actions"] > .MuiButtonBase-root').click();

    // Check that only 1 member remains
    cy.get('.MuiTablePagination-displayedRows').should('have.text', '1–1 of 1');
  });
});
