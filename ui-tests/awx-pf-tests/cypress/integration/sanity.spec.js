/*
 * Tests to ensure that the application is functioning at a basic level.
 * This suite should have read-only tests. When adding tests to this file,
 * avoiding actually creating/deleting/editing resources.
 */
context('Sanity checks', function() {
  it('Cannot log in with bad credentials and error text is helpful', function() {
    // Every test is preceded by an API login, so for this one we log out first.
    cy.visit('')
    cy.get('#toolbar-user-dropdown').click()
    cy.get('#logout-button').click()
    cy.get('.pf-c-login__container').should('be.visible')

    cy.get('#pf-login-username-id').type('BAD_USERNAME')
    cy.get('#pf-login-password-id').type('BAD_PASSWORD')
    cy.get('button[type=submit]').click()

    cy.get('.pf-c-form__helper-text').should(
      'have.text',
      'Invalid username or password. Please try again.'
    )

    cy.get('#pf-login-password-id').should('have.attr', 'aria-invalid', 'true')

    //TODO Determine how to get the css variable below
    //cy.get('#pf-login-password-id').should('have.css', '--pf-c-form-control--invalid--Background')
  })

  it('Can log out and log in', function() {
    // Every test is preceded by an API login, so for this one we log out first.
    cy.visit('')
    cy.get('#toolbar-user-dropdown').click()
    cy.get('#logout-button').click()
    cy.get('.pf-c-login__container').should('be.visible')

    cy.get('#pf-login-username-id').type(Cypress.env('AWX_E2E_USERNAME'))
    cy.get('#pf-login-password-id').type(Cypress.env('AWX_E2E_PASSWORD'))
    cy.get('button[type=submit]').click()
    cy.get('#page-sidebar').should('be.visible')
  })

  it.skip('Can view the dashboard components', function() {
    // Not implemented
    cy.visit('')
  })

  it.skip('Can view each page with limited user privileges', function() {
    // Not implemented
  })

  it('Navigation Bar correctly links to the corresponding page', function() {
    // Navigation bar check
    cy.visit('')

    // Expand all Navbar groups
    cy.get('[data-component="pf-nav-expandable"][aria-expanded="false"]')
      .each(function(item) {
        cy.wrap(item).click()
      })
      .then(function() {
        // Verify that each navbar item links to the correct page
        const navItem = '.pf-c-nav__item'
        const header = '.pf-c-breadcrumb__heading'

        // Not implemented
        //cy.get(`${navItem} > [href="/#/home"]`).click()
        //cy.get(header).should('have.text', 'Dashboard')

        cy.get(`${navItem} > [href="/#/jobs"]`).click()
        cy.get(header).should('have.text', 'Jobs')

        // Not implemented
        //cy.get(`${navItem} > [href="/#/schedules"]`).click()
        //cy.get(header).should('have.text', 'Schedules')

        // Not implemented
        //cy.get(`${navItem} > [href="/#/portal"]`).click()
        //cy.get(header).should('have.text', 'My View')

        cy.get(`${navItem} > [href="/#/templates"]`).click()
        cy.get(header).should('have.text', 'Templates')

        cy.get(`${navItem} > [href="/#/credentials"]`).click()
        cy.get(header).should('have.text', 'Credentials')

        cy.get(`${navItem} > [href="/#/projects"]`).click()
        cy.get(header).should('have.text', 'Projects')

        cy.get(`${navItem} > [href="/#/inventories"]`).click()
        cy.get(header).should('have.text', 'Inventories')

        cy.get(`${navItem} > [href="/#/hosts"]`).click()
        cy.get(header).should('have.text', 'Hosts')

        // Not implemented
        //cy.get(`${navItem} > [href="/#/inventory_scripts"]`).click()
        //cy.get(header).should('have.text', 'Inventory Scripts')

        cy.get(`${navItem} > [href="/#/organizations"]`).click()
        cy.get(header).should('have.text', 'Organizations')

        cy.get(`${navItem} > [href="/#/users"]`).click()
        cy.get(header).should('have.text', 'Users')

        cy.get(`${navItem} > [href="/#/teams"]`).click()
        cy.get(header).should('have.text', 'Teams')

        // Not implemented
        //cy.get(`${navItem} > [href="/#/credential_types"]`).click()
        //cy.get(header).should('have.text', 'Credential Types')

        // Not implemented
        //cy.get(`${navItem} > [href="/#/notification_templates"]`).click()
        //cy.get(header).should('have.text', 'Notification Templates')

        // Not implemented
        //cy.get(`${navItem} > [href="/#/management_jobs"]`).click()
        //cy.get(header).should('have.text', 'Management Jobs')

        // Not implemented
        //cy.get(`${navItem} > [href="/#/instance_groups"]`).click()
        //cy.get(header).should('have.text', 'Instance Groups')

        // Not implemented
        //cy.get(`${navItem} > [href="/#/applications"]`).click()
        //cy.get(header).should('have.text', 'Applications')

        // Not implemented
        //cy.get(`${navItem} > [href="/#/auth_settings"]`).click()
        //cy.get(header).should('have.text', 'Authentication Settings')

        // Not implemented
        //cy.get(`${navItem} > [href="/#/jobs_settings"]`).click()
        //cy.get(header).should('have.text', 'Jobs Settings')

        // Not implemented
        //cy.get(`${navItem} > [href="/#/system_settings"]`).click()
        //cy.get(header).should('have.text', 'System Settings')

        // Not implemented
        //cy.get(`${navItem} > [href="/#/ui_settings"]`).click()
        //cy.get(header).should('have.text', 'User Interface Settings')

        // Not implemented
        //cy.get(`${navItem} > [href="/#/license"]`).click()
        //cy.get(header).should('have.text', 'License')
      })
  })

  it.skip('Can directly navigate to the Dashboard page', function() {
    // Not implemented
    cy.visit('/#/home')
    cy.get('#job-list-toolbar')
  })

  it('Can directly navigate to the Jobs page', function() {
    cy.visit('/#/jobs')
    cy.get('#job-list-toolbar')
  })

  it.skip('Can directly navigate to the Schedules page', function() {
    // Not implemented
    cy.visit('/#/schedules')
    cy.get('#schedule-list-toolbar')
  })

  it.skip('Can directly navigate to the My View page', function() {
    // Not implemented
    cy.visit('/#/portal')
    cy.get('#schedule-list-toolbar')
  })

  it('Can directly navigate to the Templates page', function() {
    cy.visit('/#/templates')
    cy.get('#template-list-toolbar')
  })

  it('Can directly navigate to the Credentials page', function() {
    cy.visit('/#/credentials')
    cy.get('#credential-list-toolbar')
  })

  it('Can directly navigate to the Projects page', function() {
    cy.visit('/#/projects')
    cy.get('#project-list-toolbar')
  })

  it('Can directly navigate to the Inventories page', function() {
    cy.visit('/#/inventories')
    cy.get('#inventory-list-toolbar')
  })

  it('Can directly navigate to the Hosts page', function() {
    cy.visit('/#/hosts')
    cy.get('#host-list-toolbar')
  })

  it('Can directly navigate to the Organizations page', function() {
    cy.visit('/#/organizations')
    cy.get('#organization-list-toolbar')
  })

  it('Can directly navigate to the Users page', function() {
    cy.visit('/#/users')
    cy.get('#user-list-toolbar')
  })

  it('Can directly navigate to the Teams page', function() {
    cy.visit('/#/teams')
    cy.get('#team-list-toolbar')
  })

  it.skip('Can directly navigate to the Credential Types page', function() {
    // Not implemented
    cy.visit('/#/credential_types')
    cy.get('#credential-types-list-toolbar')
  })

  it.skip('Can directly navigate to the Notification Templates page', function() {
    // Not implemented
    cy.visit('/#/notification_templates')
    cy.get('#notification-list-toolbar')
  })

  it.skip('Can directly navigate to the Management Jobs page', function() {
    // Not implemented
    cy.visit('/#/management_jobs')
    cy.get('#management-jobs-list-toolbar')
  })

  it.skip('Can directly navigate to the Instance Groups page', function() {
    // Not implemented
    cy.visit('/#/instance_groups')
    cy.get('#instance-group-list-toolbar')
  })

  it.skip('Can directly navigate to the Applications page', function() {
    // Not implemented
    cy.visit('/#/applications')
    cy.get('#application-list-toolbar')
  })

  it.skip('Can directly navigate to the Authentication Settings page', function() {
    // Not implemented
    cy.visit('/#/auth_settings')
    cy.get('#auth-setting-list-toolbar')
  })

  it.skip('Can directly navigate to the Jobs Settings page', function() {
    // Not implemented
    cy.visit('/#/jobs_settings')
    cy.get('#job-setting-list-toolbar')
  })

  it.skip('Can directly navigate to the System Settings page', function() {
    // Not implemented
    cy.visit('/#/system_settings')
    cy.get('#system-setting-list-toolbar')
  })

  it.skip('Can directly navigate to the User Interface Settings page', function() {
    // Not implemented
    cy.visit('/#/ui_settings')
    cy.get('#ui-setting-list-toolbar')
  })

  it.skip('Can directly navigate to the User License page', function() {
    // Not implemented
    cy.visit('/#/license')
    cy.get('#license-toolbar')
  })

  it.skip('Can view each page with auditor privileges', function() {
    // Not implemented
  })

  it('Can close modal with Cancel and X buttons', function() {
    //The following is an easy way to get to a modal without any data
    cy.visit('/#/organizations/add')
    cy.get('#org-instance-groups').click()
    cy.get('[aria-label="Close"]').click()

    cy.get('#org-instance-groups').click()
    cy.get('.pf-c-modal-box__footer > .pf-m-secondary').click()
    cy.get('#org-instance-groups').should('be.visible')
  })

  it('Navbar can be opened and closed', function() {
    cy.visit('')
    cy.get('#page-sidebar').should('be.visible')
    cy.get('#nav-toggle').click()
    cy.get('#page-sidebar').should('not.be.visible')
    cy.get('#nav-toggle').click()
    cy.get('#page-sidebar').should('be.visible')
  })

  it.skip('Hoverover help icons lists the help info', function() {
    // Does not seem to function out of the box. https://docs.cypress.io/api/commands/hover.html#Workarounds
    cy.visit('/#/organizations/add')
    cy.get('.pf-c-form__label-text > svg > path').trigger('mouseover')
    cy.get('.pf-c-form__label-text > svg').trigger('mouseover')
  })

  it('Reload on a non-homepage page keeps the same context', function() {
    cy.visit('/#/organizations')
    cy.get('#organization-list-toolbar').should('be.visible')
    cy.reload()
    cy.get('#organization-list-toolbar').should('be.visible')
  })

  it('Browser navigation works', function() {
    cy.visit('/#/organizations')
    cy.get('a[aria-label=Add]').click()
    cy.url().should('contain', '/#/organizations/add')
    cy.go('back')
    cy.url().should('not.contain', '/#/organizations/add')
  })
})
