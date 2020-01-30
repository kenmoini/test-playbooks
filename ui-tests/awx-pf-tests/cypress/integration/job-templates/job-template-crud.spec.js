/**
 * Verifies CRUD operations on job templates.
 */
context('Reaches a 404', function() {
  it('reaches a 404 when trying to get the JT list', function() {
    cy.visit('/#/job_templates/999')
    // Assert that the JT is not found and a link to navigate to the dashboard exist
    cy.get('h1[class*="pf-c-title"]').should('have.text', 'Not Found')
    cy.get('a[href="#/home"]').should('have.text', 'Back to Dashboard.')
  })
})
context('Empty list of job templates', function() {
  it('Shows the add button when there is an empty list of templates', function() {})
})
context('Create Job Template', function() {
  before(function() {
    cy.createOrReplace('inventory', `create-jt-inv`).as('inv')
    cy.createOrReplace('projects', `create-jt-pro`).as('project')
  })

  it('can create a job template', function() {
    cy.visit('/#/templates')
    cy.get('button[aria-label=Add]').click()
    cy.get('a[href*="/job_template/add/"]').click()
    cy.get('#template-name').type(`create-jt-${this.testID}`)
    cy.get('#template-description').type(`Creation test for JTs. Test ID: ${this.testID}`)
    cy.get('#inventory-lookup').click()
    cy.get('input[aria-label*="Search text input"]').type(`${this.inv.name}{enter}`)
    cy.get('[aria-label="close"]')
    cy.get('[aria-label="Inventory List"]')
      .find('li')
      .should('have.length', 1)
    cy.get(`#selected-${this.inv.id}`).click()
    cy.get('[aria-label="Select Inventory"] button[class="pf-c-button pf-m-primary"]').click()
    cy.get('#project').click()
    cy.get('input[aria-label*="Search text input"]').type(`${this.project.name}{enter}`)
    cy.get('[aria-label="close"]')
    cy.get('[aria-label="Project List"]')
      .find('li')
      .should('have.length', 1)
    cy.get(`#selected-${this.project.id}`).click()
    cy.get('[aria-label="Select Project"] button[class="pf-c-button pf-m-primary"]').click()
    cy.get('#template-playbook').select('ping.yml')
    cy.get('button[aria-label=Save]').click()
    cy.get('dd[data-cy*="name"]').should('have.text', `create-jt-${this.testID}`)
  })
})

context('Edit Job Template', function() {
  before(function() {
    cy.createOrReplace('job_templates', `JT-to-edit`).as('edit')
  })

  it('can edit a job template', function() {
    cy.visit(`/#/templates/job_template/${this.edit.id}`)
    cy.get('a[aria-label=Edit]').click()
    cy.get('#template-name')
      .clear()
      .type(`edited-jt-${this.testID}`)
    cy.get('#template-description')
      .clear()
      .type(`Edited test for JTs. Test ID: ${this.testID}`)
    cy.get('button[aria-label=Save]').click()
    cy.get('dd[data-cy*="name"]').should('have.text', `edited-jt-${this.testID}`)
  })
})

context('Delete Job Template', function() {
  before(function() {
    cy.createOrReplace('job_templates', `JT-to-delete`).as('del')
  })

  it('can delete an job template', function() {
    cy.visit('/#/templates')
    cy.get('input[aria-label*="Search"]').type(`${this.del.name}{enter}`)
    cy.get('[aria-label="close"]')
    cy.get('[aria-label="Templates List"]')
      .find('li')
      .should('have.length', 1)
    cy.get(`input[id="select-jobTemplate-${this.del.id}"][type="checkbox"]:enabled`).click()
    cy.get('button[aria-label="Delete"]:enabled').click()
    cy.get('button[aria-label="confirm delete"]:enabled').click()
    // Assert that the JT is deleted and there are no Jts that match the filter criteria
    cy.get('.pf-c-empty-state .pf-c-empty-state__body').should(
      'have.class',
      'pf-c-empty-state__body'
    )
  })
})

context.skip('Job Template advanced search', function() {})
