describe("Badges management page", () => {

    function fetchBadges() {
        return cy.badges({isDeleted: false});
    }

    function fetchTriggers() {
        return cy.triggers();
    }


    /**
     *
     * @param filename fixture filename
     * @param mimeType e.g. 'image/jpg'
     * @returns {Cypress.Chainable<unknown>}
     */
    function selectFile(filename, mimeType) {
        return cy.fixture(filename, 'binary')
            .then((img) => {
                const blob = Cypress.Blob.binaryStringToBlob(img, mimeType);

                const file = new File([blob], filename, {type: mimeType});
                const list = new DataTransfer();
                list.items.add(file);
                return list.files;
            })
            .then((files) => {
                cy.get('.upload-file-input')
                    .then((input) => {
                        input[0].files = files;
                    })
                    .trigger('change', {force: true})
            })
    }

    beforeEach(() => {
        cy.login();

        /* since there is no direct link to the page */

        cy.visit('/admin/badges');
        cy.get('.action-prompt-card')
            .find('a[href="/admin/badges/manage"]')
            .click()

    })

    it('should display create badge card-button', () => {
        cy.get('.create-badge-card')
            .should('be.visible')
    });

    it('should display badge creation form', () => {
        cy.get('.creation-form .badge-form form')
            .within(() => {


                cy.get('select.trigger-select')
                    .should('be.visible');

                cy.get('input.name-input')
                    .should('be.visible');

                cy.get('textarea.description-input')
                    .should('be.visible');

                cy.get('input.expiry-input')
                    .should('be.visible');

                cy.get('input.frequency-input')
                    .should('be.visible');

                cy.get('input.points-input')
                    .should('be.visible');

                cy.get('input.reminder-input')
                    .should('be.visible');

                cy.get('textarea.reminder-message-input')
                    .should('be.visible');


            });

        cy.get('.creation-form .badge-form .upload-file-button')
            .should('be.visible');
    });

    it('should create a badge', () => {
        const badge = {
            name: 'Super learner',
            description: 'Test super learner badge description',
            expiry: `${new Date().getFullYear() + 1}-10-21`,
            frequency: 10,
            points: 1500,
            reminder: 6,
            reminderMessage: 'Complete more 5 chapters to unlock super learner badge'
        }
        cy.get('.creation-form .badge-form')
            .within(() => {

                fetchTriggers()
                    .then((triggers) => {
                        cy.get('select.trigger-select')
                            .select(triggers[0].id)
                    });

                selectFile('test.jpg', 'image/jpg'); //set badge icon


                cy.get('input.name-input')
                    .type(badge.name);

                cy.get('textarea.description-input')
                    .type(badge.description);

                cy.get('input.expiry-input')
                    .type(badge.expiry);

                cy.get('input.frequency-input')
                    .type(badge.frequency);

                cy.get('input.points-input')
                    .type(badge.points);

                cy.get('input.reminder-input')
                    .type(badge.reminder);

                cy.get('textarea.reminder-message-input')
                    .type(badge.reminderMessage);

                cy.get('button.btn-submit')
                    .click();

            });

        cy.wait(4000)
        cy.get('.badges-list .badge-card .body')
            .contains('.name', badge.name)
            .siblings()
            .contains('.points', `${badge.points} Points`)

    });

    it('should not create a badge with invalid data', () => {
        const badge = {
            name: 'A very random name? '+Math.random() * 100000,
            description: 'Test super learner badge description',
            expiry: `${new Date().getFullYear() - 1}-10-21`, //invalid date
            frequency: -10,
            points: -1500,
            reminder: -6,
            reminderMessage: 'Complete more 5 chapters to unlock super learner badge'
        }
        cy.get('.creation-form .badge-form')
            .within(() => {

                fetchTriggers()
                    .then((triggers) => {
                        cy.get('select.trigger-select')
                            .select(triggers[0].id)
                    });

                cy.get('input.name-input')
                    .type(badge.name);

                cy.get('textarea.description-input')
                    .type(badge.description);

                cy.get('input.expiry-input')
                    .type(badge.expiry);

                cy.get('input.frequency-input')
                    .type(badge.frequency);

                cy.get('input.points-input')
                    .type(badge.points);

                cy.get('input.reminder-input')
                    .type(badge.reminder);

                cy.get('textarea.reminder-message-input')
                    .type(badge.reminderMessage);

                cy.get('button.btn-submit')
                    .click();

                //
                cy.get('input.expiry-input')
                    .should('have.class', 'is-invalid');

                cy.get('input.frequency-input')
                    .should('have.class', 'is-invalid');

                cy.get('input.points-input')
                    .should('have.class', 'is-invalid');

                cy.get('input.reminder-input')
                    .should('have.class', 'is-invalid');

            });

        cy.get('.badges-list .badge-card .body')
            .find('.name')
            .should('not.contain', badge.name)

    });

    it('should display available badges', () => {
        fetchBadges()
            .then((badges) => {
                const selectedBadge = badges[Math.floor(Math.random() * badges.length)];
                cy.get(`.badges-list .badge-card#badge-card-${selectedBadge.id}`)
                    .contains('.name', selectedBadge.name.substr(0, 25))
            })
    });

    it('should edit a badge', () => {
        const updatedBadgeDetails = {
            name: 'Super creator',
            description: 'Test super creator badge description',
            expiry: `${new Date().getFullYear() + 10}-10-21`,
            frequency: 40,
            points: 400,
            reminder: 24,
            reminderMessage: 'Create more 16 chapters to unlock super creator badge'
        }
        fetchBadges()
            .then((badges) => {
                const selectedBadge = badges[Math.floor(Math.random() * badges.length)];

                cy.get(`.badges-list .badge-card#badge-card-${selectedBadge.id} .footer .dd-actions-menu`)
                    .find('.dropdown-toggle')
                    .click()
                    .siblings()
                    .focus("dropdown-menu")
                    .find('button.btn-edit')
                    .click();

                // modify the values
                cy.get('.creation-form .badge-form')
                    .scrollIntoView()
                    .within(() => {

                        cy.get('input.name-input')
                            .clear()
                            .type(updatedBadgeDetails.name);

                        cy.get('input.expiry-input')
                            .clear()
                            .type(updatedBadgeDetails.expiry);

                        cy.get('input.frequency-input')
                            .clear()
                            .type(updatedBadgeDetails.frequency);

                        cy.get('input.points-input')
                            .clear()
                            .type(updatedBadgeDetails.points);

                        cy.get('input.reminder-input')
                            .clear()
                            .type(updatedBadgeDetails.reminder);

                        cy.get('button.btn-submit')
                            .click();
                    });

                // evaluate the changes
                cy.get(`.badges-list .badge-card#badge-card-${selectedBadge.id}`)
                    .contains('.name', updatedBadgeDetails.name.substr(0, 25))
            })
    })

    it('should modify badge published status', () => {
        fetchBadges()
            .then((badges) => {
                const publishedBadged = badges.find((b) => b.published);
                const unPublishedBadged = badges.find((b) => !b.published);

                if (publishedBadged) {
                    cy.get(`.badges-list .badge-card#badge-card-${publishedBadged.id} .footer .dd-actions-menu`)
                        .find('.dropdown-toggle')
                        .click()
                        .siblings()
                        .focus("dropdown-menu")
                        .find('button.btn-publish')
                        .click();


                    cy.get(`.badges-list .badge-card#badge-card-${publishedBadged.id} .footer .dd-actions-menu`)
                        .find('.dropdown-toggle')
                        .click()
                        .siblings()
                        .focus("dropdown-menu")
                        .find('button.btn-publish')
                        .contains('Publish')

                }

                if (unPublishedBadged) {
                    cy.get(`.badges-list .badge-card#badge-card-${unPublishedBadged.id} .footer .dd-actions-menu`)
                        .find('.dropdown-toggle')
                        .click()
                        .siblings()
                        .focus("dropdown-menu")
                        .find('button.btn-publish')
                        .click();

                    cy.get(`.badges-list .badge-card#badge-card-${unPublishedBadged.id} .footer .dd-actions-menu`)
                        .find('.dropdown-toggle')
                        .click()
                        .siblings()
                        .focus("dropdown-menu")
                        .find('button.btn-publish')
                        .contains('Unpublish')
                }

            })

    })

    it('should delete a badge', () => {
        fetchBadges()
            .then((badges) => {
                const selectedBadge = badges[Math.floor(Math.random() * badges.length)];

                cy.get(`.badges-list .badge-card#badge-card-${selectedBadge.id} .footer .dd-actions-menu`)
                    .find('.dropdown-toggle')
                    .click()
                    .siblings()
                    .focus("dropdown-menu")
                    .find('button.btn-delete')
                    .click();

                cy.get(`.badges-list .badge-card#badge-card-${selectedBadge.id}`)
                    .should('not.exist')
            })

    })
})